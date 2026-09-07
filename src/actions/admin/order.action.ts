"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getAdminOrThrow } from "@/lib/auth-guard";
import { restoreOrderStock } from "@/lib/order-stock";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";
import type { PaymentStatus } from "@/generated/prisma/enums";
import type { ActionResult } from "@/types";

/**
 * Админ — захиалгын үйлдлүүд.
 *
 * Функц бүр getAdminOrThrow() дуудна. /admin layout дээрх шалгалт нь
 * зөвхөн ХУУДСЫГ хамгаална — Server Action-ыг шууд дуудаж болдог.
 */

function revalidateOrder(orderNumber: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/order/${orderNumber}`);
  revalidatePath("/account/orders");
  revalidatePath("/admin");
}

/** Утга нь захиалгын төлөв мөн эсэх */
function isOrderStatus(value: unknown): value is OrderStatusKey {
  return typeof value === "string" && value in ORDER_STATUS;
}

/**
 * ЗАХИАЛГЫН ТӨЛӨВ СОЛИХ.
 *
 * Дурын төлөв рүү үсрэхийг зөвшөөрөхгүй. "Хүлээгдэж байна"-аас шууд
 * "Хүргэгдсэн" рүү үсэрвэл бэлтгэх, хүргэх алхмууд алга болно.
 * Зөвшөөрөгдсөн шилжилтүүд constants.ts дотор бичигдсэн.
 */
export async function updateOrderStatusAction(
  orderNumber: string,
  nextStatus: unknown,
): Promise<ActionResult<{ status: OrderStatusKey }>> {
  await getAdminOrThrow();

  if (!isOrderStatus(nextStatus)) {
    return { success: false, error: "Төлөв буруу байна." };
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      status: true,
      stockRestored: true,
      payment: { select: { id: true, method: true, status: true } },
      items: {
        select: {
          variantId: true,
          quantity: true,
          variant: { select: { productId: true } },
        },
      },
    },
  });

  if (!order) return { success: false, error: "Захиалга олдсонгүй." };

  if (order.status === nextStatus) {
    return { success: false, error: "Захиалга аль хэдийн энэ төлөвт байна." };
  }

  // Шилжилт зөвшөөрөгдсөн эсэх
  const allowed: readonly string[] = ORDER_STATUS[order.status].next;

  if (!allowed.includes(nextStatus)) {
    return {
      success: false,
      error: `"${ORDER_STATUS[order.status].label}" төлвөөс "${ORDER_STATUS[nextStatus].label}" рүү шилжих боломжгүй.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    // Цуцлах бол үлдэгдлийг буцаана — зөвхөн НЭГ УДАА
    const shouldRestore = nextStatus === "CANCELLED" && !order.stockRestored;

    if (shouldRestore) {
      await restoreOrderStock(tx, order.items);
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        stockRestored: shouldRestore ? true : order.stockRestored,
      },
    });

    /*
      Хүргэлтээр төлөх (COD) захиалга хүргэгдсэн бол мөнгө нь
      гарт нь очсон гэсэн үг. Админ дахин нэг товч дарах шаардлагагүй.
    */
    if (
      nextStatus === "DELIVERED" &&
      order.payment?.method === "COD" &&
      order.payment.status === "PENDING"
    ) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }
  });

  revalidateOrder(orderNumber);

  return { success: true, data: { status: nextStatus } };
}

/** Төлбөрийн боломжит төлөвүүд */
const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

/**
 * ТӨЛБӨРИЙН ТӨЛӨВ ТЭМДЭГЛЭХ.
 *
 * Банкны шилжүүлэг ирсэн эсэхийг админ гараар шалгаж тэмдэглэнэ.
 * wire.mn-ээр төлсөн захиалга webhook-оор автоматаар баталгаажна.
 */
export async function updatePaymentStatusAction(
  orderNumber: string,
  status: unknown,
): Promise<ActionResult<{ status: PaymentStatus }>> {
  await getAdminOrThrow();

  if (!PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    return { success: false, error: "Төлбөрийн төлөв буруу байна." };
  }

  const nextStatus = status as PaymentStatus;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { payment: { select: { id: true, status: true } } },
  });

  if (!order?.payment) {
    return { success: false, error: "Төлбөрийн бичилт олдсонгүй." };
  }

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: {
      status: nextStatus,
      // Төлөгдсөн бол цагийг тэмдэглэнэ, буцаавал арилгана
      paidAt: nextStatus === "PAID" ? new Date() : null,
    },
  });

  revalidateOrder(orderNumber);

  return { success: true, data: { status: nextStatus } };
}
