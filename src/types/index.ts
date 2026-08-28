/**
 * Дундын TypeScript төрлүүд.
 * Prisma-ийн төрлүүд PHASE 3-т нэмэгдэнэ (@prisma/client-ээс import хийнэ).
 */

/** Server Action бүрийн буцаах стандарт хэлбэр */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Дэлгүүрийн filter — URL-ийн query parameter-тэй тохирно */
export type ShopSearchParams = {
  category?: string;
  size?: string;
  color?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "best-selling";
  page?: string;
  q?: string;
};
