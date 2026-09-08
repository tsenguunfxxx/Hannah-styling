import { SHIPPING_FEE } from "@/lib/constants";

/**
 * Сагсны ТООЦООЛОЛ.
 *
 * prisma-г дуудахгүй тул Server, Client хоёуланд ажиллана.
 * Мөн PHASE 9-ийн Checkout ЯГ ЭНЭ функцуудыг ашиглана — ингэснээр
 * сагс дээр харагдсан дүн, захиалгын дүн хоёр зөрөх боломжгүй.
 */

/**
 * Нэг ширхэгийн бодит үнэ.
 *
 * Дараалал: variant-ын тусгай үнэ → барааны хямдралтай үнэ → энгийн үнэ.
 */
export function resolveUnitPrice(input: {
  variantPrice: number | null;
  discountPrice: number | null;
  basePrice: number;
}): number {
  return input.variantPrice ?? input.discountPrice ?? input.basePrice;
}

/** Тооцоололд хэрэгтэй хамгийн бага мэдээлэл */
export type CartLine = {
  unitPrice: number;
  quantity: number;
};

export type CartTotals = {
  /** Барааны нийт дүн (хүргэлт, хямдрал ороогүй) */
  subtotal: number;
  /** Нийт ширхэг */
  itemCount: number;
  /** Купоны хямдрал */
  discount: number;
  /** Хүргэлтийн төлбөр */
  shippingFee: number;
  /** Эцсийн төлөх дүн */
  total: number;
  /** Үнэгүй хүргэлт хүртэл дутуу байгаа дүн. 0 бол аль хэдийн үнэгүй */
};

/**
 * Сагсны бүх тоог нэг дор бодно.
 *
 * `discount` нь купоны хямдрал. Үнэгүй хүргэлтийн босгыг
 * хямдрал ХАССАН дүнгээр шалгана — хэрэглэгчийн бодитоор
 * төлж буй дүн шалгуур болно.
 */
export function calculateCartTotals(
  lines: CartLine[],
  discount = 0,
): CartTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  // Хямдрал барааны дүнгээс хэтрэхгүй
  const safeDiscount = Math.max(0, Math.min(discount, subtotal));
  const afterDiscount = subtotal - safeDiscount;

  // Хоосон сагсанд хүргэлтийн төлбөр бодохгүй
  const shippingFee = subtotal === 0 ? 0 : SHIPPING_FEE;

  return {
    subtotal,
    itemCount,
    discount: safeDiscount,
    shippingFee,
    total: afterDiscount + shippingFee,
  };
}
