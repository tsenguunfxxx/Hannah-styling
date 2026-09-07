/**
 * Variant (размер + өнгө) -тэй ажиллах ТУСЛАХ функцууд.
 *
 * Энэ файл prisma-г огт дуудахгүй тул Server, Client хоёуланд нь ашиглагдана.
 * Тиймээс л lib/queries доторх асуулгуудаас тусад нь салгасан.
 */

/** Хувцасны размерын зөв дараалал. Цагаан толгойгоор эрэмбэлбэл L, M, S болно. */
export const SIZE_ORDER: string[] = ["XS", "S", "M", "L", "XL", "XXL", "ONE"];

/**
 * Размер харьцуулагч.
 *
 * Үсэгтэй размер (S, M, L) тогтсон дараалалтай — SIZE_ORDER-оор эрэмбэлнэ.
 * Тоон размер (хүүхдийн 90, 100, 110 болон гутлын 39, 40) нь жагсаалтад
 * байхгүй тул тоогоор нь эрэмбэлэгдэнэ. Ингэснээр шинэ тоон размер
 * нэмэхэд энэ файлыг засах шаардлагагүй.
 */
export function compareSizes(a: string, b: string): number {
  const ai = SIZE_ORDER.indexOf(a);
  const bi = SIZE_ORDER.indexOf(b);

  // Хоёулаа жагсаалтад алга = гутлын размер → тоогоор
  if (ai === -1 && bi === -1) return Number(a) - Number(b) || a.localeCompare(b);

  // Танихгүй размерыг хойш нь тавина
  if (ai === -1) return 1;
  if (bi === -1) return -1;

  return ai - bi;
}

/** Variant-аас хэрэгтэй хамгийн бага мэдээлэл */
export type VariantLike = {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  price: number | null;
};

export type ColorOption = {
  color: string;
  colorHex: string;
  /** Тухайн өнгөний БҮХ размерын нийлбэр үлдэгдэл */
  stock: number;
};

/**
 * Өнгөнүүдийг давхардуулалгүй гаргана.
 * "Black / S", "Black / M" гэсэн 2 variant → "Black" гэсэн 1 сонголт.
 */
export function getColorOptions(variants: VariantLike[]): ColorOption[] {
  const map = new Map<string, ColorOption>();

  for (const variant of variants) {
    const existing = map.get(variant.color);

    if (existing) {
      existing.stock += variant.stock;
      continue;
    }

    map.set(variant.color, {
      color: variant.color,
      colorHex: variant.colorHex,
      stock: variant.stock,
    });
  }

  return [...map.values()];
}

/** Бүх размерыг давхардуулалгүй, зөв дарааллаар */
export function getSizeOptions(variants: VariantLike[]): string[] {
  return [...new Set(variants.map((v) => v.size))].sort(compareSizes);
}

/**
 * Сонгосон өнгө + размерын яг тэр variant-ыг олно.
 * Олдохгүй бол undefined — тэр хослол байхгүй гэсэн үг.
 */
export function findVariant(
  variants: VariantLike[],
  color: string | null,
  size: string | null,
): VariantLike | undefined {
  if (!color || !size) return undefined;
  return variants.find((v) => v.color === color && v.size === size);
}

/** Тухайн өнгөнд энэ размер бэлэн байгаа эсэх */
export function isSizeAvailable(
  variants: VariantLike[],
  color: string | null,
  size: string,
): boolean {
  if (!color) {
    // Өнгө сонгоогүй бол ямар нэг өнгөнд үлдэгдэлтэй байвал болно
    return variants.some((v) => v.size === size && v.stock > 0);
  }

  const variant = findVariant(variants, color, size);
  return Boolean(variant && variant.stock > 0);
}

/** Барааны нийт үлдэгдэл */
export function getTotalStock(variants: VariantLike[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}
