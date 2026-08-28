"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CART_COOKIE, getCartWhere } from "@/lib/queries/cart.query";
import {
  addToCartSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from "@/schemas/cart.schema";
import type { ActionResult } from "@/types";

/** Зочны сагс cookie хэдэн хоног амьдрах вэ */
const GUEST_CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 хоног

/**
 * Хэрэглэгчийн сагсыг олно, байхгүй бол шинээр үүсгэнэ.
 *
 * Нэвтэрсэн хүн  → userId-гаар
 * Зочин          → cookie доторх санамсаргүй id-гаар
 *
 * Ингэснээр нэвтрээгүй ч гэсэн сагсанд бараа хийж чадна.
 */
async function getOrCreateCart(): Promise<string> {
  const session = await auth();

  if (session?.user) {
    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
      select: { id: true },
    });

    return cart.id;
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true, // JavaScript-ээс уншиж чадахгүй → аюулгүй
      sameSite: "lax",
      path: "/",
      maxAge: GUEST_CART_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });
  }

  const cart = await prisma.cart.upsert({
    where: { sessionId },
    create: { sessionId },
    update: {},
    select: { id: true },
  });

  return cart.id;
}

/**
 * Сагсанд бараа нэмэх.
 *
 * Үлдэгдлийг СЕРВЕР дээр шалгана. Client дээрх шалгалт зөвхөн
 * тав тухын төлөө — түүнийг тойрч болно, серверийнхийг үгүй.
 */
export async function addToCartAction(
  input: unknown,
): Promise<ActionResult<{ quantity: number }>> {
  const parsed = addToCartSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  const { variantId, quantity } = parsed.data;

  // Variant болон түүний бараа идэвхтэй эсэхийг шалгана
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: {
      id: true,
      stock: true,
      size: true,
      color: true,
      product: { select: { isActive: true, name: true } },
    },
  });

  if (!variant || !variant.product.isActive) {
    return { success: false, error: "Бараа олдсонгүй." };
  }

  if (variant.stock === 0) {
    return {
      success: false,
      error: `${variant.color} / ${variant.size} размер дууссан байна.`,
    };
  }

  const cartId = await getOrCreateCart();

  // Сагсанд аль хэдийн байгаа эсэх — байвал тоог нэмнэ
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
    select: { quantity: true },
  });

  const currentQuantity = existing?.quantity ?? 0;
  const nextQuantity = currentQuantity + quantity;

  if (nextQuantity > variant.stock) {
    const remaining = variant.stock - currentQuantity;

    return {
      success: false,
      error:
        remaining > 0
          ? `Үлдэгдэл хүрэлцэхгүй байна. Дээд тал нь ${remaining} ширхэг нэмэх боломжтой.`
          : "Энэ барааны бүх үлдэгдэл сагсанд чинь байна.",
    };
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    create: { cartId, variantId, quantity },
    update: { quantity: nextQuantity },
  });

  // Сагсны хуудсыг хуучин өгөгдөлтэй үлдээхгүй.
  // Navbar дээрх тоог client талаас router.refresh()-ээр шинэчилнэ —
  // ингэснээр хэрэглэгчийн сонголт (өнгө, размер) хэвээр үлдэнэ.
  revalidatePath("/cart");

  return { success: true, data: { quantity: nextQuantity } };
}

/**
 * Сагсны тухайн мөр ҮНЭХЭЭР энэ хүнийх мөн эсэхийг шалгана.
 *
 * АЮУЛГҮЙ БАЙДЛЫН ГОЛ ЦЭГ: itemId-г хэн ч зохиож илгээж чадна.
 * Тиймээс "энэ мөр миний сагсанд байгаа юу?" гэдгийг заавал шалгана.
 * Үгүй бол өөр хүний сагсыг засах боломжтой болно.
 */
async function findOwnedCartItem(itemId: string) {
  const where = await getCartWhere();
  if (!where) return null;

  const cart = await prisma.cart.findFirst({ where, select: { id: true } });
  if (!cart) return null;

  return prisma.cartItem.findFirst({
    // id БОЛОН cartId хоёулаа тааруулна
    where: { id: itemId, cartId: cart.id },
    select: {
      id: true,
      quantity: true,
      variant: { select: { stock: true, size: true, color: true } },
    },
  });
}

/** Сагсны мөрийн тоо ширхэгийг өөрчлөх */
export async function updateCartItemAction(
  input: unknown,
): Promise<ActionResult<{ quantity: number }>> {
  const parsed = updateCartItemSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  const { itemId, quantity } = parsed.data;

  const item = await findOwnedCartItem(itemId);
  if (!item) return { success: false, error: "Сагсанд ийм бараа алга." };

  if (quantity > item.variant.stock) {
    return {
      success: false,
      error: `Үлдэгдэл хүрэлцэхгүй байна. Дээд тал нь ${item.variant.stock} ширхэг.`,
    };
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  revalidatePath("/cart");

  return { success: true, data: { quantity } };
}

/** Сагснаас нэг мөр хасах */
export async function removeCartItemAction(
  input: unknown,
): Promise<ActionResult<void>> {
  const parsed = removeCartItemSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Мэдээлэл буруу байна." };
  }

  const item = await findOwnedCartItem(parsed.data.itemId);
  if (!item) return { success: false, error: "Сагсанд ийм бараа алга." };

  await prisma.cartItem.delete({ where: { id: item.id } });

  revalidatePath("/cart");

  return { success: true, data: undefined };
}

/** Сагсыг бүхэлд нь хоослох */
export async function clearCartAction(): Promise<ActionResult<void>> {
  const where = await getCartWhere();
  if (!where) return { success: false, error: "Сагс олдсонгүй." };

  const cart = await prisma.cart.findFirst({ where, select: { id: true } });
  if (!cart) return { success: false, error: "Сагс олдсонгүй." };

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  revalidatePath("/cart");

  return { success: true, data: undefined };
}
