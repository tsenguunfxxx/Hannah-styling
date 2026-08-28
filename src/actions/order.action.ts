"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/queries/cart.query";
import { restoreOrderStock } from "@/lib/order-stock";
import { COUPON_COOKIE } from "@/lib/queries/coupon.query";
import { checkoutSchema } from "@/schemas/order.schema";
import { ORDER_NUMBER_PREFIX } from "@/lib/constants";
import { Prisma } from "@/generated/prisma/client";
import type { PaymentMethod } from "@/generated/prisma/enums";
import type { ActionResult } from "@/types";

/**
 * Үлдэгдэл хүрэлцэхгүй болсныг илэрхийлэх тусгай алдаа.
 * Энгийн Error-оос ялгаж барихын тулд өөрийн класс үүсгэв.
 */
class OutOfStockError extends Error {}

/** Купон хэрэглэх боломжгүй болсныг илэрхийлнэ */
class CouponError extends Error {}

/**
 * Захиалгын дугаар үүсгэх: HN-260826-0001
 *
 * Тухайн ӨДРИЙН захиалгын тоог хараад дараагийнхыг өгнө.
 * Хоёр хүн яг зэрэг захиалбал ижил дугаар гарч болзошгүй —
 * тийм тохиолдолд database татгалзаж, доор нь дахин оролдоно.
 */
async function buildOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await tx.order.count({
    where: { createdAt: { gte: startOfDay } },
  });

  const datePart = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const sequence = String(countToday + 1).padStart(4, "0");

  return `${ORDER_NUMBER_PREFIX}-${datePart}-${sequence}`;
}

/**
 * ЗАХИАЛГА ҮҮСГЭХ — энэ төслийн хамгийн эмзэг үйлдэл.
 *
 * Доорх бүх алхам ЭСВЭЛ бүгд болно, ЭСВЭЛ юу ч болохгүй ($transaction):
 *   1. Үлдэгдлийг хасах
 *   2. Купоны хэрэглээг бүртгэх
 *   3. Захиалга + барааны хуулбар үүсгэх
 *   4. Төлбөрийн бичилт үүсгэх
 *   5. Сагсыг хоослох
 *
 * Дунд нь алдаа гарвал бүгд буцна — үлдэгдэл хасагдчихаад
 * захиалга үүсээгүй гэх мэт эвдрэлтэй байдал үүсэхгүй.
 */
export async function createOrderAction(
  input: unknown,
): Promise<ActionResult<{ orderNumber: string }>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Эхлээд нэвтэрнэ үү." };
  }

  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  const form = parsed.data;

  // Сагсыг СЕРВЕР дээр дахин уншина.
  // Client-ээс ирсэн үнэ, тоог хэзээ ч итгэж болохгүй.
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Сагс хоосон байна." };
  }

  // Захиалахын өмнөх шалгалт — хэрэглэгчид ойлгомжтой мессеж өгөхийн тулд
  for (const item of cart.items) {
    const { product } = item.variant;

    if (!product.isActive) {
      return {
        success: false,
        error: `"${product.name}" бараа одоогоор зарагдахгүй байна.`,
      };
    }

    if (item.variant.stock < item.quantity) {
      return {
        success: false,
        error: `"${product.name}" (${item.variant.color}/${item.variant.size}) үлдэгдэл хүрэлцэхгүй байна.`,
      };
    }
  }

  const { subtotal, shippingFee, discount, total } = cart.totals;
  const couponId = cart.coupon?.couponId ?? null;

  // Дугаар давхцвал 3 удаа дахин оролдоно
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const orderNumber = await prisma.$transaction(async (tx) => {
        // --- 1. Үлдэгдлийг АТОМААР хасах ---
        for (const item of cart.items) {
          const result = await tx.productVariant.updateMany({
            // stock >= quantity нөхцөлийг ДАТАБААЗ өөрөө шалгана.
            // Хоёр хүн сүүлийн ширхэгийг зэрэг авах гэвэл
            // зөвхөн НЭГ нь л амжина.
            where: { id: item.variant.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

          if (result.count === 0) {
            throw new OutOfStockError(
              `"${item.variant.product.name}" (${item.variant.color}/${item.variant.size}) үлдэгдэл дууссан байна.`,
            );
          }
        }

        // --- 2. Купоны хэрэглээг АТОМААР нэмэх ---
        if (couponId) {
          const coupon = await tx.coupon.findUnique({
            where: { id: couponId },
            select: { maxUses: true },
          });

          /*
            Хязгаартай купонд `usedCount < maxUses` нөхцөлийг ДАТАБААЗ
            шалгана. Сүүлийн нэг эрхийг хоёр хүн зэрэг авах гэвэл
            зөвхөн нэг нь л амжина — үлдэгдэл хасахтай ижил зарчим.
          */
          const guard =
            coupon?.maxUses == null
              ? { id: couponId }
              : { id: couponId, usedCount: { lt: coupon.maxUses } };

          const used = await tx.coupon.updateMany({
            where: guard,
            data: { usedCount: { increment: 1 } },
          });

          if (used.count === 0) {
            throw new CouponError("Купоны хэрэглэх хязгаар дууссан байна.");
          }
        }

        // --- 3. Захиалга + барааны хуулбар ---
        const number = await buildOrderNumber(tx);

        const order = await tx.order.create({
          data: {
            orderNumber: number,
            userId: session.user.id,
            subtotal,
            shippingFee,
            discount,
            couponId,
            total,

            customerName: form.customerName,
            phone: form.phone,
            email: form.email || null,
            district: form.district,
            addressLine: form.addressLine,
            note: form.note || null,

            items: {
              create: cart.items.map((item) => ({
                variantId: item.variant.id,
                // Үнэ, нэр, зургийг ХУУЛЖ хадгална.
                // Маргааш үнэ өөрчлөгдсөн ч энэ захиалга хэвээрээ.
                productName: item.variant.product.name,
                productSlug: item.variant.product.slug,
                image: item.variant.product.images[0]?.url ?? null,
                size: item.variant.size,
                color: item.variant.color,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
              })),
            },

            payment: {
              create: {
                method: form.paymentMethod as PaymentMethod,
                amount: total,
                // Бодит төлбөр PHASE 13-д холбогдоно
                status: "PENDING",
              },
            },
          },
          select: { orderNumber: true },
        });

        // --- 4. "Хамгийн их зарагдсан" тоолуур ---
        for (const item of cart.items) {
          await tx.product.update({
            where: { slug: item.variant.product.slug },
            data: { soldCount: { increment: item.quantity } },
          });
        }

        // --- 5. Сагсыг хоослох ---
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order.orderNumber;
      });

      // Купоныг ашигласан тул cookie-г цэвэрлэнэ —
      // дараагийн захиалгад дахин хэрэглэгдэхээс сэргийлнэ
      if (couponId) (await cookies()).delete(COUPON_COOKIE);

      // Дараагийн удаад хаягийг урьдчилж бөглөхийн тулд хадгална
      await saveDefaultAddress(session.user.id, form);

      revalidatePath("/cart");
      revalidatePath("/account/orders");

      return { success: true, data: { orderNumber } };
    } catch (error) {
      if (error instanceof OutOfStockError || error instanceof CouponError) {
        return { success: false, error: error.message };
      }

      // P2002 = давхардсан утга. Захиалгын дугаар мөргөлдсөн тул дахин оролдоно.
      const isDuplicate =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (!isDuplicate) throw error;
    }
  }

  return {
    success: false,
    error: "Захиалга үүсгэж чадсангүй. Дахин оролдоно уу.",
  };
}

/**
 * Хэрэглэгчид хадгалсан хаяг байхгүй бол энэ захиалгын хаягийг хадгална.
 * Дараагийн удаад маягт өөрөө бөглөгдөнө.
 *
 * Алдаа гарвал ЧИМЭЭГҮЙ өнгөрнө — захиалга аль хэдийн амжилттай болсон,
 * хаяг хадгалж чадаагүйн улмаас хэрэглэгчийг айлгах хэрэггүй.
 */
async function saveDefaultAddress(
  userId: string,
  form: {
    customerName: string;
    phone: string;
    district: string;
    addressLine: string;
  },
) {
  try {
    const existing = await prisma.address.count({ where: { userId } });
    if (existing > 0) return;

    await prisma.address.create({
      data: {
        userId,
        recipientName: form.customerName,
        phone: form.phone,
        district: form.district,
        addressLine: form.addressLine,
        isDefault: true,
      },
    });
  } catch (error) {
    console.error("Хаягийг хадгалж чадсангүй:", error);
  }
}

/** Хэрэглэгч өөрөө цуцалж болох төлвүүд */
const CANCELLABLE_BY_CUSTOMER = ["PENDING", "CONFIRMED"];

/**
 * ЗАХИАЛГА ЦУЦЛАХ.
 *
 * Хасагдсан үлдэгдлийг БУЦААЖ нэмнэ. Гэхдээ `stockRestored` тугийг
 * шалгаж байж — үгүй бол хоёр удаа дарахад үлдэгдэл давхар нэмэгдэнэ.
 */
export async function cancelOrderAction(
  orderNumber: string,
): Promise<ActionResult<void>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Эхлээд нэвтэрнэ үү." };
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      userId: true,
      status: true,
      stockRestored: true,
      items: {
        select: {
          variantId: true,
          quantity: true,
          variant: { select: { productId: true } },
        },
      },
    },
  });

  // Өөрийнх биш бол "олдсонгүй" гэж хариулна —
  // бусдын захиалга байгаа эсэхийг ч мэдэгдэхгүй
  if (!order || order.userId !== session.user.id) {
    return { success: false, error: "Захиалга олдсонгүй." };
  }

  if (order.status === "CANCELLED") {
    return { success: false, error: "Энэ захиалга аль хэдийн цуцлагдсан." };
  }

  if (!CANCELLABLE_BY_CUSTOMER.includes(order.status)) {
    return {
      success: false,
      error:
        "Бэлтгэж эхэлсэн захиалгыг цуцлах боломжгүй. Бидэнтэй холбогдоно уу.",
    };
  }

  await prisma.$transaction(async (tx) => {
    // Үлдэгдлийг буцаах — зөвхөн НЭГ УДАА
    if (!order.stockRestored) {
      await restoreOrderStock(tx, order.items);
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", stockRestored: true },
    });
  });

  revalidatePath("/account/orders");
  revalidatePath(`/order/${orderNumber}`);

  return { success: true, data: undefined };
}
