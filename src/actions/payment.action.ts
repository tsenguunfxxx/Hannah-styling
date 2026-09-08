"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createWireCheckoutSession,
  createWireIntent,
  isWireConfigured,
  retrieveWireIntent,
} from "@/lib/wire";
import { bankTransferSchema } from "@/schemas/payment.schema";
import type { ActionResult } from "@/types";

/**
 * Төлбөрийн үйлдлүүд.
 *
 * АЮУЛГҮЙ БАЙДАЛ: захиалга бүрд эзэмшлийг шалгана. Дугаарыг
 * таамаглаад өөр хүний төлбөртэй тоглох боломжгүй.
 */

/**
 * Сайтын үндсэн хаяг.
 *
 * Төгсгөлийн "/"-г хасна. Vercel дээр хаягаа хуулж тавихад ихэвчлэн
 * "https://site.vercel.app/" гэж ордог — тэгвэл холбоос "...app//api/..."
 * болж хоёр ташуу зураастай болно.
 */
function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100").replace(
    /\/+$/,
    "",
  );
}

/** Захиалгыг олоод, энэ хүнийх мөн эсэхийг шалгана */
async function findOwnedOrder(orderNumber: string) {
  const session = await auth();
  if (!session?.user) return null;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      status: true,
      total: true,
      phone: true,
      payment: {
        select: {
          id: true,
          method: true,
          status: true,
          amount: true,
          wireIntentId: true,
        },
      },
    },
  });

  if (!order) return null;

  const isOwner = order.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  return isOwner || isAdmin ? order : null;
}

function revalidateOrder(orderNumber: string) {
  revalidatePath(`/order/${orderNumber}`);
  revalidatePath(`/order/${orderNumber}/pay`);
  revalidatePath("/account/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
}

/**
 * Төлбөрийг төлөгдсөн гэж тэмдэглэх — нэг л газар.
 *
 * Захиалгыг ч ЗЭРЭГ баталгаажуулна. Хоёрыг нэг гүйлгээнд оруулсан
 * тул аль нэг нь бүтэлгүйтвэл хоёулаа хуучин хэвээрээ үлдэнэ —
 * "төлбөр төлөгдсөн мөртлөө захиалга хүлээгдэж байна" гэсэн
 * зөрүү үүсэхгүй.
 */
async function markPaid(
  paymentId: string,
  orderId: string,
  transactionId: string | null,
) {
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", paidAt: new Date(), transactionId },
    }),
    /*
      Зөвхөн "Хүлээгдэж байна" төлөвтэй байвал л урагшлуулна.
      Админ аль хэдийн хүргэлтэнд гаргасан бол буцаахгүй.
    */
    prisma.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "CONFIRMED" },
    }),
  ]);
}

// ------------------------------------------------------------
// WIRE.MN
// ------------------------------------------------------------
/**
 * wire.mn-ий төлөх хуудас руу явуулах холбоос үүсгэнэ.
 *
 * Hosted checkout ашиглаж байгаа тул QR, банкны сонголтыг бид
 * зурахгүй — wire.mn-ий хуудас өөрөө харуулна. Хэрэглэгч төлөөд
 * буцаж ирнэ, харин ЖИНХЭНЭ баталгаажуулалт нь webhook-оор ирнэ.
 */
export async function startWirePaymentAction(
  orderNumber: string,
): Promise<ActionResult<{ url: string }>> {
  const order = await findOwnedOrder(orderNumber);
  if (!order?.payment) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.payment.status === "PAID") {
    return { success: false, error: "Энэ захиалга аль хэдийн төлөгдсөн." };
  }

  if (order.status === "CANCELLED") {
    return {
      success: false,
      error: "Цуцлагдсан захиалгын төлбөр төлөх боломжгүй.",
    };
  }

  if (!isWireConfigured()) {
    return {
      success: false,
      error: "wire.mn тохируулаагүй байна. .env файлд түлхүүрээ нэмнэ үү.",
    };
  }

  try {
    const appUrl = getAppUrl();

    const intent = await createWireIntent({
      orderNumber: order.orderNumber,
      // Дүнг DB-ээс авна — browser-аас ирсэн утгад итгэхгүй
      amountTugrik: order.payment.amount,
      description: `HANNAH захиалга ${order.orderNumber}`,
    });

    const session = await createWireCheckoutSession({
      intentId: intent.id,
      successUrl: `${appUrl}/order/${order.orderNumber}`,
      cancelUrl: `${appUrl}/order/${order.orderNumber}/pay`,
    });

    // Intent-ийн дугаарыг хадгална — webhook ирэхэд шалгахад хэрэгтэй
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { wireIntentId: intent.id },
    });

    return { success: true, data: { url: session.url } };
  } catch (error) {
    console.error("wire.mn:", error);
    return {
      success: false,
      error: "Төлбөрийн хуудас нээж чадсангүй. Дахин оролдоно уу.",
    };
  }
}

/**
 * Төлбөр төлөгдсөн эсэхийг wire.mn-ээс шалгана.
 *
 * Webhook бол үндсэн зам. Гэвч сүлжээ тасрах, endpoint түр
 * унтрах зэргээр мэдэгдэл ирэхгүй байж болно. Тиймээс хэрэглэгч
 * өөрөө шалгах боломжтой байх ёстой — үгүй бол төлчихөөд
 * "төлөгдөөгүй" гэсэн захиалгатай үлдэнэ.
 */
export async function checkWirePaymentAction(
  orderNumber: string,
): Promise<ActionResult<{ paid: boolean }>> {
  const order = await findOwnedOrder(orderNumber);
  if (!order?.payment) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.payment.status === "PAID") {
    return { success: true, data: { paid: true } };
  }

  if (!order.payment.wireIntentId) {
    return { success: false, error: "Төлбөр эхлүүлээгүй байна." };
  }

  try {
    const intent = await retrieveWireIntent(order.payment.wireIntentId);

    if (intent.status !== "succeeded") {
      return { success: true, data: { paid: false } };
    }

    await markPaid(order.payment.id, order.id, order.payment.wireIntentId);
    revalidateOrder(orderNumber);

    return { success: true, data: { paid: true } };
  } catch (error) {
    console.error("wire.mn шалгалт:", error);
    return { success: false, error: "Төлбөрийг шалгаж чадсангүй." };
  }
}

export async function submitBankTransferAction(
  orderNumber: string,
  input: unknown,
): Promise<ActionResult<void>> {
  const order = await findOwnedOrder(orderNumber);
  if (!order?.payment) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.payment.status === "PAID") {
    return { success: false, error: "Энэ захиалга аль хэдийн төлөгдсөн." };
  }

  const parsed = bankTransferSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: { transactionId: parsed.data.transactionId },
  });

  revalidateOrder(orderNumber);

  return { success: true, data: undefined };
}

// ------------------------------------------------------------
// ТУРШИЛТЫН ГОРИМ
// ------------------------------------------------------------
/**
 * Төлбөрийн gateway-гүйгээр урсгалыг турших.
 *
 * ХОЁР хамгаалалт:
 *   1. Production-д ОГТ ажиллахгүй
 *   2. wire.mn тохируулсан бол ажиллахгүй
 *
 * Ингэснээр бодит дэлгүүр дээр энэ товчоор төлбөр "төлөгдөх" аргагүй.
 */
export async function simulatePaymentAction(
  orderNumber: string,
): Promise<ActionResult<void>> {
  if (process.env.NODE_ENV === "production") {
    return { success: false, error: "Энэ үйлдэл боломжгүй." };
  }

  if (isWireConfigured()) {
    return {
      success: false,
      error: "wire.mn тохируулагдсан тул туршилтын горим унтраалттай.",
    };
  }

  const order = await findOwnedOrder(orderNumber);
  if (!order?.payment) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.payment.status === "PAID") {
    return { success: false, error: "Энэ захиалга аль хэдийн төлөгдсөн." };
  }

  await markPaid(order.payment.id, order.id, `TEST-${Date.now()}`);
  revalidateOrder(orderNumber);

  return { success: true, data: undefined };
}
