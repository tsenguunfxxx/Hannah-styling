import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

/** Админы жагсаалтад нэг хуудсанд хэдэн бараа */
export const ADMIN_PAGE_SIZE = 20;

export type AdminProductFilters = {
  q?: string;
  categoryId?: string;
  /** all = бүгд, active/inactive = төлвөөр, low = үлдэгдэл багатай */
  status?: "all" | "active" | "inactive" | "low";
  page?: number;
};

/** URL-ийн түүхий утгыг найдвартай хэлбэрт оруулна */
export function parseAdminProductFilters(
  raw: Record<string, string | string[] | undefined>,
): Required<AdminProductFilters> {
  const status = raw.status;
  const page = Number(raw.page);

  return {
    q: typeof raw.q === "string" ? raw.q.trim() : "",
    categoryId: typeof raw.categoryId === "string" ? raw.categoryId : "",
    status:
      status === "active" || status === "inactive" || status === "low"
        ? status
        : "all",
    // Буруу утга ирвэл 1-р хуудас
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

function buildWhere(filters: Required<AdminProductFilters>) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { slug: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) where.categoryId = filters.categoryId;

  if (filters.status === "active") where.isActive = true;
  if (filters.status === "inactive") where.isActive = false;

  // "Үлдэгдэл багатай" = ядаж нэг variant нь босгоос доош
  if (filters.status === "low") {
    where.variants = { some: { stock: { lte: LOW_STOCK_THRESHOLD } } };
  }

  return where;
}

/** Админы барааны жагсаалт */
export async function getAdminProducts(filters: Required<AdminProductFilters>) {
  const where = buildWhere(filters);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (filters.page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        discountPrice: true,
        isActive: true,
        isFeatured: true,
        soldCount: true,
        updatedAt: true,
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        variants: { select: { stock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((product) => ({
      ...product,
      // Нийт үлдэгдлийг энд бодоод өгнө — UI дахин тоолох шаардлагагүй
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      variantCount: product.variants.length,
    })),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

/** Засварлах маягтад дүүргэх бүрэн өгөгдөл */
export async function getProductForEdit(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      details: true,
      basePrice: true,
      discountPrice: true,
      categoryId: true,
      isActive: true,
      isFeatured: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, publicId: true, alt: true },
      },
      variants: {
        orderBy: [{ color: "asc" }, { size: "asc" }],
        select: {
          id: true,
          size: true,
          color: true,
          colorHex: true,
          stock: true,
          sku: true,
          price: true,
        },
      },
    },
  });
}

/** Сонголтын жагсаалт — "Эмэгтэй › Даашинз" хэлбэрээр */
export async function getCategoryOptions() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      parent: { select: { name: true } },
    },
  });

  return (
    categories
      .map((category) => ({
        id: category.id,
        label: category.parent
          ? `${category.parent.name} › ${category.name}`
          : category.name,
      }))
      // Нэрээр эрэмбэлбэл эцэг ба түүний дэд ангиллууд зэрэгцэн байрлана:
      // "Эмэгтэй", "Эмэгтэй › Даашинз", "Эмэгтэй › Өмд" ...
      .sort((a, b) => a.label.localeCompare(b.label, "mn"))
  );
}

export type AdminProductRow = Awaited<
  ReturnType<typeof getAdminProducts>
>["products"][number];

export type ProductForEdit = NonNullable<
  Awaited<ReturnType<typeof getProductForEdit>>
>;

export type CategoryOption = Awaited<ReturnType<typeof getCategoryOptions>>[number];
