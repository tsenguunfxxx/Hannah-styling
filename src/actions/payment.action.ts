"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  checkQpayPayment,
  createQpayInvoice,
  isQpayConfigured,
  type QpayBankUrl,
} from "@/lib/qpay";
import { bankTransferSchema } from "@/schemas/payment.schema";
import type { ActionResult } from "@/types";

/**
 * Төлбөрийн үйлдлүүд.
 *
 * АЮУЛГҮЙ БАЙДАЛ: захиалга бүрд эзэмшлийг шалгана. Дугаарыг
 * таамаглаад өөр хүний төлбөртэй тоглох боломжгүй.
 */

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
          qpayInvoiceId: true,
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

/** Төлбөрийг төлөгдсөн гэж тэмдэглэх — нэг л газар */
async function markPaid(paymentId: string, transactionId: string | null) {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "PAID", paidAt: new Date(), transactionId },
  });
}

// ------------------------------------------------------------
// QPAY — НЭХЭМЖЛЭХ ҮҮСГЭХ
// ------------------------------------------------------------
export type QpayInvoiceResult = {
  qrImage: string;
  qrText: string;
  bankUrls: QpayBankUrl[];
};

export async function startQpayPaymentAction(
  orderNumber: string,
): Promise<ActionResult<QpayInvoiceResult>> {
  const order = await findOwnedOrder(orderNumber);
  if (!order?.payment) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.payment.status === "PAID") {
    return { success: false, error: "Энэ захиалга аль хэдийн төлөгдсөн." };
  }

  if (order.status === "CANCELLED") {
    return { success: false, error: "Цуцлагдсан захиалгын төлбөр төлөх боломжгүй." };
  }

  if (!isQpayConfigured()) {
    return {
      success: false,
      error:
        "QPay тохируулаагүй байна. .env файлд мерчантын түлхүүрээ нэмнэ үү.",
    };
  }

  try {
    /*
      Төгсгөлийн "/"-г хасна. Vercel дээр хаягаа хуулж тавихад ихэвчлэн
      "https://site.vercel.app/" гэж ордог — тэгвэл доорх холбоос
      "...app//api/..." болж хоёр ташуу зураастай болно.
    */
    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100"
    ).replace(/\/+$/, "");

    const invoice = await createQpayInvoice({
      senderInvoiceNo: order.orderNumber,
      receiverCode: order.phone,
      description: `HANNAH захиалга ${order.orderNumber}`,
      amount: order.payment.amount,
      // QPay төлбөр орсныг ЭНЭ хаягаар мэдэгдэнэ
      callbackUrl: `${appUrl}/api/payment/qpay/callback?order=${order.orderNumber}`,
    });

    // invoice_id-г хадгална — дараа нь шалгахад хэрэгтэй
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { qpayInvoiceId: invoice.invoiceId },
    });

    return {
      success: true,
      data: {
        qrImage: invoice.qrImage,
        qrText: invoice.qrText,
        bankUrls: invoice.bankUrls,
      },
    };
  } catch (error) {
    console.error("QPay нэхэмжлэх:", error);
    return {
      success: false,
      error: "QPay-тэй холбогдож чадсангүй. Түр хүлээгээд дахин оролдоно уу.",
    };
  }
}

// ------------------------------------------------------------
// ТӨЛБӨР ШАЛГАХ
// ------------------------------------------------------------
/**
 * Төлөгдсөн эсэхийг QPay-гээс асууна.
 *
 * Callback ирээгүй байж болно (сүлжээ тасарсан, сервер унтарсан).
 * Тиймээс хэрэглэгч "Шалгах" товч дарж өөрөө шаардаж чадна.
 */
export async function checkPaymentStatusAction(
  orderNumber: string,
): Promise<ActionResult<{ paid: boolean }>> {
  const order = await findOwnedOrder(orderNumber);
  if (!order?.payment) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.payment.status === "PAID") {
    return { success: true, data: { paid: true } };
  }

  if (!order.payment.qpayInvoiceId) {
    return { success: false, error: "Нэхэмжлэх үүсгээгүй байна." };
  }

  try {
    const result = await checkQpayPayment(order.payment.qpayInvoiceId);

    if (!result.paid) {
      return { success: true, data: { paid: false } };
    }

    await markPaid(order.payment.id, result.transactionId);
    revalidateOrder(orderNumber);

    return { success: true, data: { paid: true } };
  } catch (error) {
    console.error("QPay шалгалт:", error);
    return { success: false, error: "Төлбөрийг шалгаж чадсангүй." };
  }
}

// ------------------------------------------------------------
// БАНКНЫ ШИЛЖҮҮЛЭГ
// ------------------------------------------------------------
/**
 * Хэрэглэгч гүйлгээний дугаараа мэдэгдэнэ.
 *
 * Төлөв нь "Төлөгдөөгүй" ХЭВЭЭР үлдэнэ — банкны шилжүүлгийг
 * зөвхөн админ дансаа хараад баталгаажуулна. Хэрэглэгчийн үг
 * дээр тулгуурлан төлөгдсөн гэж тэмдэглэвэл луйврын үүд нээгдэнэ.
 */
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
 * QPay-гүйгээр төлбөрийн урсгалыг турших.
 *
 * ХОЁР хамгаалалт:
 *   1. Production-д ОГТ ажиллахгүй
 *   2. QPay тохируулсан бол ажиллахгүй
 *
 * Ингэснээр бодит дэлгүүр дээр энэ товчоор төлбөр "төлөгдөх" аргагүй.
 */
export async function simulatePaymentAction(
  orderNumber: string,
): Promise<ActionResult<void>> {
  if (process.env.NODE_ENV === "production") {
    return { success: false, error: "Энэ үйлдэл боломжгүй." };
  }

  if (isQpayConfigured()) {
    return {
      success: false,
      error: "QPay тохируулагдсан тул туршилтын горим унтраалттай.",
    };
  }

  const order = await findOwnedOrder(orderNumber);
  if (!order?.payment) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.payment.status === "PAID") {
    return { success: false, error: "Энэ захиалга аль хэдийн төлөгдсөн." };
  }

  await markPaid(order.payment.id, `TEST-${Date.now()}`);
  revalidateOrder(orderNumber);

  return { success: true, data: undefined };
}
