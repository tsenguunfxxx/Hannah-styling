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

  let event: WireEvent;

  try {
    event = JSON.parse(rawBody) as WireEvent;
  } catch {
    return NextResponse.json({ error: "JSON буруу" }, { status: 400 });
  }

  // Холболт шалгах ping — хариу өгөөд өнгөрнө
  if (event.type === "endpoint.verification") {
    return NextResponse.json({ received: true });
  }

  /*
    Бидний сонирхдог хоёр төрөл: төлөгдсөн, эсвэл бүтэлгүйтсэн.
    Бусдыг нь 200-аар өнгөрөөнө — алдаа буцаавал wire.mn "хүрч
    чадсангүй" гэж үзээд дахин дахин илгээх гэж оролдоно.
  */
  const succeeded = event.type === "payment_intent.succeeded";
  const failed = FAILURE_EVENTS.includes(event.type ?? "");

  if (!succeeded && !failed) {
    return NextResponse.json({ received: true });
  }

  const intentId = extractIntentId(event);

  if (!intentId) {
    return NextResponse.json({ error: "Нэхэмжлэх олдсонгүй" }, { status: 400 });
  }

  /*
    Захиалгыг МЕТАДАТА-гаар биш, нэхэмжлэхийн дугаараар олно.

    Яагаад? Мэдэгдлийн дотоод бүтэц баримт бичигт заагаагүй тул
    metadata дамжиж ирнэ гэдэгт найдах эрсдэлтэй. Харин `wireIntentId`-г
    бид ӨӨРСДӨӨ хадгалсан — тиймээс дугаараар нь эргүүлж олоход
    хангалттай. Ингэснээр өөр захиалгын төлбөрийг иш татах ч аргагүй.
  */
  const payment = await prisma.payment.findFirst({
    where: { wireIntentId: intentId },
    select: { id: true, orderId: true, status: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Захиалга олдсонгүй" }, { status: 404 });
  }

  if (payment.status === "PAID") {
    // Нэг үйл явдал олон удаа ирж болно — давхар бичихгүй
    return NextResponse.json({ status: "ALREADY_PAID" });
  }

  try {
    /*
      2-р хамгаалалт: Wire-ээс ӨӨРСДӨӨ асууна.

      Мэдэгдэлд бичсэнийг шууд үнэн гэж авахгүй. Гарын үсэг зөв
      байсан ч сүлжээнд саатсан хуучин мэдэгдэл дахин ирж болно.
      Эх сурвалжаас нь асуух нь цорын ганц найдвартай зам.
    */
    const intent = await retrieveWireIntent(intentId);

    if (intent.status === "succeeded") {
      /*
        Төлбөр БОЛОН захиалгыг ЗЭРЭГ шинэчилнэ.

        Хоёрыг нэг гүйлгээнд оруулсан шалтгаан: аль нэг нь бүтэлгүйтвэл
        хоёулаа хуучин хэвээрээ үлдэнэ. Үгүй бол "төлбөр төлөгдсөн
        мөртлөө захиалга хүлээгдэж байна" гэсэн зөрүү үүсэж болно.
      */
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId: intentId,
          },
        }),
        /*
          Захиалга "Хүлээгдэж байна" дээр байвал л баталгаажуулна.
          Хэрэв админ аль хэдийн урагшлуулсан (жишээ нь хүргэлтэнд
          гаргасан) бол түүнийг БУЦААХГҮЙ.
        */
        prisma.order.updateMany({
          where: { id: payment.orderId, status: "PENDING" },
          data: { status: "CONFIRMED" },
        }),
      ]);

      return NextResponse.json({ status: "PAID" });
    }

    // Бүтэлгүйтсэн эсэх нь Wire дээрх ЖИНХЭНЭ төлвөөр шийдэгдэнэ
    if (intent.status === "canceled") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ status: "FAILED" });
    }

    // Хараахан төлөгдөөгүй — юу ч өөрчлөхгүй
    return NextResponse.json({ status: "NOT_PAID" });
  } catch (error) {
    console.error("wire.mn callback:", error);
    // 500 буцаавал wire.mn дахин оролдоно — түр зуурын саатал бол зөв зан
    return NextResponse.json({ error: "Шалгаж чадсангүй" }, { status: 500 });
  }
}

/**
 * Төлбөр бүтэлгүйтсэнийг илэрхийлэх үйл явдлууд.
 *
 * Wire-ийн баримт бичигт бүтэн жагсаалт байхгүй тул түгээмэл
 * нэрсийг бүгдийг нь барина. Аль нь ирсэн ч дээрх код Wire-ээс
 * жинхэнэ төлвийг асууж баталгаажуулдаг тул алдаа гарахгүй.
 */
const FAILURE_EVENTS = [
  "payment_intent.failed",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "payment_intent.cancelled",
];

// ------------------------------------------------------------

type WireResource = {
  id?: string;
  object?: string;
  payment_intent?: string;
};

/*
  `WireResource`-ийн `object` нь төрлийн НЭР (string). Харин үйл явдлын
  `data.object` нь нөөц ӨӨРӨӨ ч байж болно. Хоёрыг шууд нийлүүлбэл
  TypeScript `string & object` = боломжгүй төрөл гэж үзнэ. Тиймээс
  `object`-ыг хасаад дахин зарлана.
*/
type WireEventData = Omit<WireResource, "object"> & {
  object?: WireResource | string;
};

type WireEvent = {
  type?: string;
  data?: WireEventData;
};

/**
 * Мэдэгдлээс нэхэмжлэхийн дугаарыг (pi_...) салгаж авна.
 *
 * Wire-ийн `data` талбарын дотоод бүтэц баримт бичигт заагаагүй.
 * Тиймээс хэд хэдэн боломжит байрлалыг шалгана:
 *
 *   data.object.id              — нөөцийг `object` дотор боосон
 *   data.id                     — нөөцийг шууд `data` дотор тавьсан
 *   data.object.payment_intent  — charge мэт өөр нөөц ирсэн
 *   data.payment_intent
 *
 * Аль нь ч ирсэн ажиллана. Буруу утга ирвэл доорх хайлт олохгүй
 * тул юу ч өөрчлөгдөхгүй — аюулгүй.
 */
function extractIntentId(event: WireEvent): string | null {
  const data: WireEventData | undefined = event.data;
  if (!data) return null;

  /*
    `object` нь нөөцийн ТӨРЛИЙН нэр (string) байж ч болно, эсвэл
    нөөц өөрөө (object) байж ч болно. Зөвхөн сүүлийнхийг задална.
  */
  const nested: WireResource | undefined =
    data.object !== null && typeof data.object === "object"
      ? data.object
      : undefined;

  const candidates = [
    nested?.id,
    nested?.payment_intent,
    data.id,
    data.payment_intent,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.startsWith("pi_")) return value;
  }

  return null;
}
