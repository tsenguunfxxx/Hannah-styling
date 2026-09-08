import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateCartTotals, resolveUnitPrice } from "@/lib/cart-utils";
import { getAppliedCoupon } from "@/lib/queries/coupon.query";
import type { Prisma } from "@/generated/prisma/client";

/** Зочны сагсыг таних cookie-ийн нэр */
export const CART_COOKIE = "hannah_cart";

/**
 * Нэвтэрсэн хэрэглэгчийн id — ЗӨВХӨН тэр хэрэглэгч үнэхээр байгаа бол.
 *
 * Нэвтрэх мэдээлэл cookie дотор JWT хэлбэрээр хадгалагддаг тул
 * админ хэрэглэгчийг устгасан ч тэр cookie хүчинтэй хэвээр үлддэг.
 * Шалгахгүй бол байхгүй хэрэглэгчийн сагсыг хайж, сагс байнга
 * хоосон харагдах эсвэл "Foreign key" алдаа өгнө.
 *
 * Сагс УНШИХ, БИЧИХ хоёр зам энэ нэг функцийг ашиглана —
 * ингэснээр хоёулаа үргэлж ижил сагс руу заана.
 */
export async function getVerifiedUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  const exists = await prisma.user.count({ where: { id: session.user.id } });

  return exists > 0 ? session.user.id : null;
}

/**
 * Одоогийн хүний сагсыг ЯАЖ олох вэ гэдэг нөхцөл.
 *
 * Нэвтэрсэн бол userId-гаар, зочин бол cookie доторх id-гаар.
 * null буцаавал сагс огт байхгүй гэсэн үг.
 *
 * Энэ нэг функцийг бүх асуулга, үйлдэл ашигладаг тул
 * "хэний сагс вэ" гэдэг логик нэг л газар бичигдсэн.
 */
export async function getCartWhere(): Promise<Prisma.CartWhereInput | null> {
  const userId = await getVerifiedUserId();
  if (userId) return { userId };

  const sessionId = (await cookies()).get(CART_COOKIE)?.value;
  if (sessionId) return { sessionId };

  return null;
}

/** Navbar дээрх сагсны badge-д харуулах нийт ширхэг */
export async function getCartItemCount(): Promise<number> {
  const where = await getCartWhere();
  if (!where) return 0;

  const cart = await prisma.cart.findFirst({
    where,
    select: { items: { select: { quantity: true } } },
  });

  if (!cart) return 0;

  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Сагсны БҮРЭН агуулга — хуудсанд харуулахад хэрэгтэй бүх зүйл.
 * Мөр бүрийн үнэ, нийт дүн, хүргэлтийн төлбөрийг энд бодно.
 */
export async function getCart() {
  const where = await getCartWhere();
  if (!where) return null;

  const cart = await prisma.cart.findFirst({
    where,
    select: {
      id: true,
      items: {
        // Тогтвортой дараалал — тоо өөрчлөхөд мөр үсрэхгүй
        orderBy: { id: "asc" },
        select: {
          id: true,
          quantity: true,
          variant: {
            select: {
              id: true,
              size: true,
              color: true,
              colorHex: true,
              stock: true,
              price: true,
              product: {
                select: {
                  name: true,
                  slug: true,
                  basePrice: true,
                  discountPrice: true,
                  isActive: true,
                  category: { select: { name: true } },
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { url: true, alt: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) return null;

  const items = cart.items.map((item) => {
    const unitPrice = resolveUnitPrice({
      variantPrice: item.variant.price,
      discountPrice: item.variant.product.discountPrice,
      basePrice: item.variant.product.basePrice,
    });

    return {
      ...item,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      /** Сагсанд хийснээс хойш үлдэгдэл багассан эсэх */
      exceedsStock: item.quantity > item.variant.stock,
    };
  });

  /*
    Купоны хямдралыг ЭНД бодно.
    Сагс, checkout, захиалга үүсгэх гурвуулаа getCart()-ыг дууддаг тул
    гурван газарт ижил дүн гарна — зөрөх боломжгүй.
  */
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const applied = await getAppliedCoupon(subtotal);

  return {
    id: cart.id,
    items,
    coupon: applied,
    totals: calculateCartTotals(items, applied?.discount ?? 0),
  };
}

export type CartWithTotals = NonNullable<Awaited<ReturnType<typeof getCart>>>;
export type CartLineItem = CartWithTotals["items"][number];

/** Navbar дээрх wishlist-ийн тоо */
export async function getWishlistCount(): Promise<number> {
  const session = await auth();
  if (!session?.user) return 0;

  return prisma.wishlistItem.count({
    where: { wishlist: { userId: session.user.id } },
  });
}
