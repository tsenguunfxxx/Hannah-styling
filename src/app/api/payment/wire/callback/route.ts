import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getWireWebhookSecret,
  retrieveWireIntent,
  verifyWireSignature,
  WIRE_SIGNATURE_HEADER,
} from "@/lib/wire";

/**
 * WIRE.MN-ИЙН МЭДЭГДЭЛ ХҮЛЭЭН АВАХ ХАЯГ.
 *
 * Төлбөр орсны дараа wire.mn энэ хаяг руу POST хийнэ.
 *
 * ХОЁР ДАВХАР ХАМГААЛАЛТ:
 *
 *   1. ГАРЫН ҮСЭГ — хүсэлт үнэхээр wire.mn-ээс ирсэн эсэхийг
 *      нууц түлхүүрээр шалгана. Хуурамч дуудлага энд таслагдана.
 *
 *   2. ДАХИН АСУУЛТ — гарын үсэг зөв байсан ч бид Wire-ээс
 *      "үнэхээр төлөгдсөн үү" гэж ӨӨРСДӨӨ асууна. Мэдэгдлийн
 *      агуулгад тулгуурлан захиалга төлөгдсөн гэж тэмдэглэхгүй.
 *
 * Энэ route нь proxy.ts-ийн шалгалтаас гадуур (matcher нь /api-г алгасдаг) —
 * wire.mn бол манай хэрэглэгч биш, нэвтэрч чадахгүй.
 */
export async function POST(request: Request) {
  const secret = getWireWebhookSecret();

  if (!secret) {
    return NextResponse.json(
      { error: "wire.mn webhook тохируулаагүй" },
      { status: 503 },
    );
  }

  /*
    Түүхий текстээр уншина. request.json() ашиглавал JSON задарч,
    буцааж бичихэд хоосон зай, талбарын дараалал өөрчлөгдөн
    гарын үсэг таарахаа болино.
  */
  const rawBody = await request.text();

  const valid = verifyWireSignature(
    rawBody,
    request.headers.get(WIRE_SIGNATURE_HEADER),
    secret,
  );

  if (!valid) {
    // Дэлгэрэнгүй шалтгаан хэлэхгүй — таах гэж буй хүнд туслах хэрэггүй
    return NextResponse.json({ error: "Гарын үсэг буруу" }, { status: 401 });
  }

  let event: {
    type?: string;
    data?: { object?: { id?: string; metadata?: { order_number?: string } } };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON буруу" }, { status: 400 });
  }

  // Холболт шалгах ping — хариу өгөөд өнгөрнө
  if (event.type === "endpoint.verification") {
    return NextResponse.json({ received: true });
  }

  if (event.type !== "payment_intent.succeeded") {
    // Бусад үйл явдлыг сонирхохгүй ч 200 буцаана.
    // Алдаа буцаавал wire.mn дахин дахин илгээх гэж оролдоно.
    return NextResponse.json({ received: true });
  }

  const intentId = event.data?.object?.id;
  const orderNumber = event.data?.object?.metadata?.order_number;

  if (!intentId || !orderNumber) {
    return NextResponse.json({ error: "Мэдээлэл дутуу" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      payment: {
        select: { id: true, status: true, amount: true, wireIntentId: true },
      },
    },
  });

  if (!order?.payment) {
    return NextResponse.json({ error: "Захиалга олдсонгүй" }, { status: 404 });
  }

  /*
    Мэдэгдэл дэх intent нь ЭНЭ захиалгынх мөн эсэхийг шалгана.
    Үгүй бол өөр захиалгын амжилттай төлбөрийг иш татаж
    төлөөгүй захиалгаа төлөгдсөн болгох боломж үүснэ.
  */
  if (order.payment.wireIntentId !== intentId) {
    return NextResponse.json({ error: "Нэхэмжлэх таарахгүй" }, { status: 409 });
  }

  if (order.payment.status === "PAID") {
    return NextResponse.json({ status: "ALREADY_PAID" });
  }

  try {
    // 2-р хамгаалалт: Wire-ээс өөрсдөө асууна
    const intent = await retrieveWireIntent(intentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json({ status: "NOT_PAID" });
    }

    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        transactionId: intentId,
      },
    });

    return NextResponse.json({ status: "PAID" });
  } catch (error) {
    console.error("wire.mn callback:", error);
    // 500 буцаавал wire.mn дахин оролдоно — түр зуурын саатал бол зөв зан
    return NextResponse.json({ error: "Шалгаж чадсангүй" }, { status: 500 });
  }
}
