import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/queries/cart.query";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/constants";

/**
 * ЗОЧНЫ САГСЫГ ХЭРЭГЛЭГЧИЙН САГСТАЙ НЭГТГЭХ.
 *
 * Хүн нэвтрэхгүйгээр бараа сагсалдаг. Дараа нь нэвтрэхэд тэр сагс
 * алга болвол хамгийн эвгүй. Тиймээс нэвтрэх мөчид нэгтгэнэ.
 *
 * lib/auth.ts доторх `events.signIn`-ээс дуудагдана.
 */
export async function mergeGuestCartIntoUser(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    select: {
      id: true,
      items: {
        select: {
          variantId: true,
          quantity: true,
          variant: { select: { stock: true } },
        },
      },
    },
  });

  // Нэгтгэсэн эсэхээс үл хамааран cookie-г цэвэрлэнэ —
  // үгүй бол гарсны дараа хуучин зочны сагс дахин гарч ирнэ
  cookieStore.delete(CART_COOKIE);

  if (!guestCart) return;

  // Хоосон зочны сагсыг зүгээр л устгана
  if (guestCart.items.length === 0) {
    await prisma.cart.delete({ where: { id: guestCart.id } });
    return;
  }

  const userCart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: {
      id: true,
      items: { select: { variantId: true, quantity: true } },
    },
  });

  // Хэрэглэгчид аль хэдийн байгаа тоо
  const existing = new Map(
    userCart.items.map((item) => [item.variantId, item.quantity]),
  );

  const writes = guestCart.items
    // Дууссан барааг зөөх утгагүй
    .filter((item) => item.variant.stock > 0)
    .map((item) => {
      // Хоёр сагсны тоог нэмээд, үлдэгдэл болон дээд хязгаараар таслана
      const merged = Math.min(
        (existing.get(item.variantId) ?? 0) + item.quantity,
        item.variant.stock,
        MAX_QUANTITY_PER_ITEM,
      );

      return prisma.cartItem.upsert({
        where: {
          cartId_variantId: { cartId: userCart.id, variantId: item.variantId },
        },
        create: {
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: merged,
        },
        update: { quantity: merged },
      });
    });

  // Бүгд эсвэл юу ч биш — хагас нэгтгэсэн байдалд орохгүй
  await prisma.$transaction([
    ...writes,
    prisma.cart.delete({ where: { id: guestCart.id } }),
  ]);
}
