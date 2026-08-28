"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getCart } from "@/lib/queries/cart.query";
import { COUPON_COOKIE, validateCoupon } from "@/lib/queries/coupon.query";
import { normalizeCouponCode } from "@/lib/coupon";
import type { ActionResult } from "@/types";

/** Купон cookie хэдэн хоног амьдрах вэ */
const COUPON_MAX_AGE = 60 * 60 * 24 * 7; // 7 хоног

function revalidateCartPages() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

/**
 * КУПОН ХЭРЭГЛЭХ.
 *
 * Зөвхөн КОДЫГ cookie-д хадгална, хямдралын дүнг ХАДГАЛАХГҮЙ.
 * Дүнг хуудас ачаалагдах бүрд серверт дахин бодно — үгүй бол
 * хэрэглэгч cookie-гоо гараар засаад хямдралаа өсгөж чадна.
 */
export async function applyCouponAction(
  rawCode: unknown,
): Promise<ActionResult<{ code: string; discount: number }>> {
  if (typeof rawCode !== "string") {
    return { success: false, error: "Купоны код буруу байна." };
  }

  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Сагс хоосон байна." };
  }

  // Хямдралгүй барааны нийт дүнгээр шалгана
  const subtotal = cart.totals.subtotal;
  const check = await validateCoupon(rawCode, subtotal);

  if (!check.valid) {
    return { success: false, error: check.error };
  }

  const cookieStore = await cookies();

  cookieStore.set(COUPON_COOKIE, normalizeCouponCode(rawCode), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COUPON_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });

  revalidateCartPages();

  return {
    success: true,
    data: { code: check.coupon.code, discount: check.discount },
  };
}

/** Купоныг цуцлах */
export async function removeCouponAction(): Promise<ActionResult<void>> {
  const cookieStore = await cookies();
  cookieStore.delete(COUPON_COOKIE);

  revalidateCartPages();

  return { success: true, data: undefined };
}
