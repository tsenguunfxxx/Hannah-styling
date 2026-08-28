import { prisma } from "@/lib/prisma";

/**
 * Бараа УНШИХ асуулгууд.
 * Component дотор prisma-г шууд дуудахгүй — бүх асуулга энд төвлөрнө.
 * Ингэснээр нэг газраас засвал бүх хуудсанд нөлөөлнө.
 */

/** Барааны карт дээр харуулахад хэрэгтэй талбарууд */
const cardSelect = {
  id: true,
  name: true,
  slug: true,
  basePrice: true,
  discountPrice: true,
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" },
    take: 2, // 1 дэх нь үндсэн, 2 дахь нь hover зураг
    select: { url: true, alt: true },
  },
  variants: {
    select: { color: true, colorHex: true, stock: true },
  },
} as const;

/** Шинээр нэмэгдсэн бараа */
export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
}

/** Хамгийн их зарагдсан бараа */
export async function getBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { soldCount: "desc" },
    take: limit,
    select: cardSelect,
  });
}

/** Онцлох collection */
export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
}

/** Хямдралтай бараа — discountPrice утгатай бүтээгдэхүүн */
export async function getSaleProducts(limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true, discountPrice: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
}

/**
 * Барааны картын өгөгдлийн төрөл.
 * Асуулгаас АВТОМАТААР гаргаж авч байгаа тул select-ээ өөрчлөхөд
 * төрөл нь өөрөө шинэчлэгдэнэ.
 */
export type ProductCardItem = Awaited<ReturnType<typeof getNewArrivals>>[number];

/**
 * Барааны ДЭЛГЭРЭНГҮЙ хуудасны бүх өгөгдөл.
 * Зураг, variant, сэтгэгдэл — нэг асуулгаар цуг татна.
 * Олон удаа database руу очвол хуудас удаан ачаалагдана.
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        orderBy: [{ color: "asc" }, { size: "asc" }],
        select: {
          id: true,
          size: true,
          color: true,
          colorHex: true,
          stock: true,
          price: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          // ЗӨВХӨН нэр. Имэйл, нууц үг зэргийг frontend рүү хэзээ ч гаргахгүй.
          user: { select: { name: true } },
        },
      },
    },
  });
}

/**
 * Холбоотой бараа — ижил ангиллын бусад бараа.
 * Тухайн барааг өөрийг нь хасна.
 */
export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: excludeProductId },
    },
    orderBy: { soldCount: "desc" },
    take: limit,
    select: cardSelect,
  });
}

/** Дэлгэрэнгүй хуудсанд ирэх барааны төрөл */
export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;

/** Нэг сэтгэгдлийн төрөл */
export type ProductReview = ProductDetail["reviews"][number];
