import { z } from "zod";

/**
 * Дэлгүүрийн filter-ийн төлөвийг URL-д хадгална.
 * Жишээ: /shop?category=gutal&size=41&sort=price-asc&page=2
 *
 * Яагаад URL-д хадгалдаг вэ?
 *  - Хэрэглэгч линкээ хуваалцаж чадна
 *  - Буцах товч зөв ажиллана
 *  - Хуудас дахин ачаалагдсан ч сонголт алдагдахгүй
 */

export const SORT_OPTIONS = [
  { value: "newest", label: "Шинээр нэмэгдсэн" },
  { value: "price-asc", label: "Үнэ: багаас их рүү" },
  { value: "price-desc", label: "Үнэ: ихээс бага руу" },
  { value: "best-selling", label: "Хамгийн их зарагдсан" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const sortValues = SORT_OPTIONS.map((o) => o.value) as [SortValue, ...SortValue[]];

/** URL-ийн утга нэг ч байж болно, олон ч байж болно (?size=S&size=M) */
type RawParams = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

const numberParam = z.coerce.number().int().nonnegative().optional();

const schema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  sizes: z.array(z.string().max(10)).default([]),
  colors: z.array(z.string().max(30)).default([]),
  minPrice: numberParam,
  maxPrice: numberParam,
  inStock: z.boolean().default(false),
  sale: z.boolean().default(false),
  featured: z.boolean().default(false),
  sort: z.enum(sortValues).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export type ShopParams = z.infer<typeof schema>;

/**
 * URL-ийн түүхий утгуудыг найдвартай төрөл рүү хөрвүүлнэ.
 * Хэн нэгэн ?page=-5 гэж бичсэн ч програм унахгүй — Zod засаж өгнө.
 */
export function parseShopParams(raw: RawParams): ShopParams {
  const parsed = schema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
    sizes: toArray(raw.size),
    colors: toArray(raw.color),
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
    inStock: raw.inStock === "true",
    sale: raw.sale === "true",
    featured: raw.featured === "true",
    sort: typeof raw.sort === "string" ? raw.sort : undefined,
    page: raw.page,
  });

  // Алдаатай утга ирвэл анхны төлөв рүү буцна
  return parsed.success ? parsed.data : schema.parse({});
}

/** Идэвхтэй filter байгаа эсэх — "Цэвэрлэх" товч харуулах эсэхэд */
export function hasActiveFilters(params: ShopParams): boolean {
  return Boolean(
    params.category ||
      params.sizes.length ||
      params.colors.length ||
      params.minPrice ||
      params.maxPrice ||
      params.inStock ||
      params.sale ||
      params.featured,
  );
}
