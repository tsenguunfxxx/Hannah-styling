import { prisma } from "@/lib/prisma";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { ShopParams } from "@/lib/shop-params";
import type { Prisma } from "@/generated/prisma/client";
import { compareSizes } from "@/lib/variant-utils";

/**
 * Дэлгүүрийн хуудасны асуулгууд.
 * Filter-ийн нөхцөлийг нэг газар цуглуулж, дэлгүүр болон хайлт хоёулаа ашиглана.
 */

/** Ангиллын slug-аас өөрийг нь БОЛОН дэд ангиллуудыг нь олно */
async function resolveCategoryIds(slug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, children: { select: { id: true } } },
  });

  if (!category) return [];

  return [category.id, ...category.children.map((c) => c.id)];
}

/** Filter-ийн нөхцөлийг Prisma-ийн where болгон хөрвүүлнэ */
async function buildWhere(params: ShopParams): Promise<Prisma.ProductWhereInput> {
  const where: Prisma.ProductWhereInput = { isActive: true };

  // Хайлтын үг — нэр, тайлбар, ангилалаас хайна
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { category: { name: { contains: params.q, mode: "insensitive" } } },
    ];
  }

  // Ангилал — эцэг ангилал сонговол дэд ангиллууд нь бас орно
  if (params.category) {
    const ids = await resolveCategoryIds(params.category);
    // Ангилал олдоогүй бол хоосон үр дүн буцаана
    where.categoryId = { in: ids.length > 0 ? ids : ["_"] };
  }

  // Үнэ — урьдчилан бодсон effectivePrice дээр шүүнэ
  if (params.minPrice || params.maxPrice) {
    where.effectivePrice = {
      ...(params.minPrice ? { gte: params.minPrice } : {}),
      ...(params.maxPrice ? { lte: params.maxPrice } : {}),
    };
  }

  if (params.sale) where.discountPrice = { not: null };
  if (params.featured) where.isFeatured = true;

  /**
   * Размер, өнгө, үлдэгдэл — эдгээр нь variant дээр байна.
   * `some` = "энэ нөхцөлд тохирох variant ЯДАЖ НЭГ байгаа бараа".
   * Гурвуулаа зэрэг өгвөл НЭГ variant бүх нөхцөлийг хангасан байх ёстой —
   * "хар өнгийн M размер үлдэгдэлтэй" гэсэн утгатай.
   */
  const variantWhere: Prisma.ProductVariantWhereInput = {};
  if (params.sizes.length) variantWhere.size = { in: params.sizes };
  if (params.colors.length) variantWhere.color = { in: params.colors };
  if (params.inStock) variantWhere.stock = { gt: 0 };

  if (Object.keys(variantWhere).length > 0) {
    where.variants = { some: variantWhere };
  }

  return where;
}

/** Эрэмбэлэлтийг Prisma-ийн orderBy болгоно */
function buildOrderBy(sort: ShopParams["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { effectivePrice: "asc" };
    case "price-desc":
      return { effectivePrice: "desc" };
    case "best-selling":
      return { soldCount: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

/** Дэлгүүрийн барааны жагсаалт + нийт тоо + хуудасны тоо */
export async function getShopProducts(params: ShopParams) {
  const where = await buildWhere(params);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(params.sort),
      skip: (params.page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        discountPrice: true,
        category: { select: { name: true, slug: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
          select: { url: true, alt: true },
        },
        variants: { select: { color: true, colorHex: true, stock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page: params.page,
    totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
  };
}

/**
 * Filter-д харуулах сонголтууд.
 * Байхгүй размер, өнгийг харуулах утгагүй — бодит өгөгдлөөс гаргаж авна.
 */
export async function getFilterOptions() {
  const [variants, priceRange, categories] = await Promise.all([
    prisma.productVariant.findMany({
      where: { product: { isActive: true } },
      select: { size: true, color: true, colorHex: true },
    }),
    prisma.product.aggregate({
      where: { isActive: true },
      _min: { effectivePrice: true },
      _max: { effectivePrice: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    }),
  ]);

  // Давхардлыг арилгана
  const sizes = [...new Set(variants.map((v) => v.size))].sort(compareSizes);
  const colors = [
    ...new Map(variants.map((v) => [v.color, v])).values(),
  ].sort((a, b) => a.color.localeCompare(b.color));

  return {
    sizes,
    colors: colors.map((c) => ({ name: c.color, hex: c.colorHex })),
    minPrice: priceRange._min.effectivePrice ?? 0,
    maxPrice: priceRange._max.effectivePrice ?? 0,
    parentCategories: categories.filter((c) => !c.parentId),
    childCategories: categories.filter((c) => c.parentId),
  };
}

export type FilterOptions = Awaited<ReturnType<typeof getFilterOptions>>;
