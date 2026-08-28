import type { CouponType } from "@/generated/prisma/enums";

/**
 * Купоны ТООЦООЛОЛ.
 *
 * prisma-г дуудахгүй тул Server, Client хоёуланд ажиллана.
 * Сагс, checkout, захиалга үүсгэх гурвуулаа ЯГ ЭНЭ функцийг ашиглана —
 * ингэснээр гурван газарт өөр өөр дүн гарах боломжгүй.
 */

/** Хямдрал бодоход хэрэгтэй хамгийн бага мэдээлэл */
export type CouponLike = {
  type: CouponType;
  value: number;
};

/**
 * Хямдралын дүнг бодно.
 *
 * PERCENT: value = 10 → 10%
 * FIXED:   value = 20000 → 20,000₮
 *
 * Хямдрал барааны дүнгээс хэтрэхгүй — үгүй бол нийт дүн сөрөг болно.
 */
export function calculateDiscount(
  coupon: CouponLike,
  subtotal: number,
): number {
  const raw =
    coupon.type === "PERCENT"
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;

  // 0-ээс бага, subtotal-аас их байж болохгүй
  return Math.max(0, Math.min(raw, subtotal));
}

/** Хэрэглэгчид харуулах тайлбар: "10%" эсвэл "20,000₮" */
export function describeCoupon(coupon: CouponLike): string {
  return coupon.type === "PERCENT"
    ? `${coupon.value}%`
    : `${new Intl.NumberFormat("mn-MN").format(coupon.value)}₮`;
}

/** Купоны код цэвэрлэх — том үсгээр, хоосон зайгүй */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
