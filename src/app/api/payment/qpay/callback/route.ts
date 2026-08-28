import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkQpayPayment, isQpayConfigured } from "@/lib/qpay";

/**
 * QPAY-ИЙН МЭДЭГДЭЛ ХҮЛЭЭН АВАХ ХАЯГ.
 *
 * Төлбөр орсны дараа QPay энэ хаяг руу дуудна.
 *
 * ХАМГИЙН ЧУХАЛ ЗАРЧИМ: энэ хүсэлтэд ИТГЭХГҮЙ.
 * Хаяг нь ил тул хэн ч дуудаж чадна. Тиймээс мэдэгдэл ирмэгц
 * бид QPay-гээс ӨӨРСДӨӨ асууж баталгаажуулна. Хуурамч дуудлага
 * ирвэл QPay "төлөгдөөгүй" гэж хариулах тул юу ч өөрчлөгдөхгүй.
 *
 * Энэ route нь proxy.ts-ийн шалгалтаас гадуур (matcher нь /api-г алгасдаг) —
 * QPay бол манай хэрэглэгч биш, нэвтэрч чадахгүй.
 */
export async function GET(request: Request) {
  const orderNumber = new URL(request.url).searchParams.get("order");

  if (!orderNumber) {
    return NextResponse.json({ error: "order дутуу" }, { status: 400 });
  }

  if (!isQpayConfigured()) {
    return NextResponse.json({ error: "QPay тохируулаагүй" }, { status: 503 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      payment: { select: { id: true, status: true, qpayInvoiceId: true } },
    },
  });

  if (!order?.payment?.qpayInvoiceId) {
    return NextResponse.json({ error: "Нэхэмжлэх олдсонгүй" }, { status: 404 });
  }

  // Аль хэдийн төлөгдсөн бол дахин бичих шаардлагагүй
  if (order.payment.status === "PAID") {
    return NextResponse.json({ status: "ALREADY_PAID" });
  }

  try {
    const result = await checkQpayPayment(order.payment.qpayInvoiceId);

    if (!result.paid) {
      return NextResponse.json({ status: "NOT_PAID" });
    }

    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        transactionId: result.transactionId,
      },
    });

    return NextResponse.json({ status: "PAID" });
  } catch (error) {
    console.error("QPay callback:", error);
    return NextResponse.json({ error: "Шалгаж чадсангүй" }, { status: 500 });
  }
}

/** QPay зарим тохиолдолд POST-оор дууддаг — ижил логик ажиллана */
export const POST = GET;
