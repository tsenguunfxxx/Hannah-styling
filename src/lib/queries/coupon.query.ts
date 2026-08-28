import { prisma } from "@/lib/prisma";
import { calculateDiscount, normalizeCouponCode } from "@/lib/coupon";
import { formatPrice } from "@/lib/utils";

/**
 * Купон ШАЛГАХ.
 *
 * Дөрвөн зүйлийг дараалан шалгана:
 *   1. Ийм код байгаа эсэх
 *   2. Идэвхтэй, хугацаа нь хүчинтэй эсэх
 *   3. Хэрэглэсэн тоо хязгаараас хэтрээгүй эсэх
 *   4. Захиалгын дүн доод хязгаарт хүрсэн эсэх
 *
 * Алдаа бүрд ӨӨР мессеж — хэрэглэгч яагаад болохгүй байгааг мэднэ.
 */
export type CouponCheck =
  | {
      valid: true;
      coupon: { id: string; code: string; type: "PERCENT" | "FIXED"; value: number };
      discount: number;
    }
  | { valid: false; error: string };

export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponCheck> {
  const code = normalizeCouponCode(rawCode);

  if (!code) return { valid: false, error: "Купоны код хоосон байна." };

  const coupon = await prisma.coupon.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      minOrder: true,
      maxUses: true,
      usedCount: true,
      startsAt: true,
      expiresAt: true,
      isActive: true,
    },
  });

  if (!coupon) return { valid: false, error: "Ийм купон олдсонгүй." };

  if (!coupon.isActive) {
    return { valid: false, error: "Энэ купон идэвхгүй байна." };
  }

  const now = new Date();

  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, error: "Энэ купон хараахан эхлээгүй байна." };
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: "Энэ купоны хугацаа дууссан байна." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Энэ купоны хэрэглэх хязгаар дууссан." };
  }

  if (coupon.minOrder !== null && subtotal < coupon.minOrder) {
    return {
      valid: false,
      error: `Энэ купон ${formatPrice(coupon.minOrder)}-аас дээш захиалгад хүчинтэй.`,
    };
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    },
    discount: calculateDiscount(coupon, subtotal),
  };
}

/** Хэрэглэсэн купоныг санах cookie */
export const COUPON_COOKIE = "hannah_coupon";

/**
 * Cookie дотор хадгалсан купоныг унших ба ДАХИН шалгах.
 *
 * Яагаад дахин шалгав? Сагс өөрчлөгдөж, доод хязгаараас бага
 * болсон байж болно. Эсвэл админ купоныг унтраасан байж болно.
 * Тиймээс хуудас ачаалагдах бүрд шинээр шалгана.
 */
export async function getAppliedCoupon(subtotal: number): Promise<
  | { code: string; couponId: string; discount: number }
  | { code: string; couponId: null; discount: 0; error: string }
  | null
> {
  const { cookies } = await import("next/headers");
  const code = (await cookies()).get(COUPON_COOKIE)?.value;

  if (!code) return null;

  const check = await validateCoupon(code, subtotal);

  if (!check.valid) {
    // Хүчингүй болсныг ХАРУУЛНА — чимээгүй алга болвол
    // хэрэглэгч "хямдрал минь хаачив?" гэж эргэлзэнэ
    return { code, couponId: null, discount: 0, error: check.error };
  }

  return {
    code: check.coupon.code,
    couponId: check.coupon.id,
    discount: check.discount,
  };
}
