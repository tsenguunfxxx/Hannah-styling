import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Хэрэглэгч энэ бараанд сэтгэгдэл бичиж чадах эсэх.
 *
 * ЗӨВХӨН БОДИТООР ХУДАЛДАЖ АВСАН хүн бичнэ. Үгүй бол өрсөлдөгч
 * эсвэл санамсаргүй хүн худал үнэлгээ өгч чадна.
 *
 * "Худалдаж авсан" гэдгийг ХҮРГЭГДСЭН захиалгаар тодорхойлно —
 * бараагаа гартаа аваагүй хүн үнэлэх боломжгүй.
 */
export async function getReviewEligibility(productId: string) {
  const session = await auth();

  if (!session?.user) {
    return { signedIn: false, canReview: false, myReview: null };
  }

  const userId = session.user.id;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (!product) {
    return { signedIn: true, canReview: false, myReview: null };
  }

  const [purchased, myReview] = await Promise.all([
    prisma.orderItem.findFirst({
      where: {
        order: { userId, status: "DELIVERED" },
        OR: [
          // Хэвийн тохиолдол — variant холбоо бүрэн
          { variant: { productId } },
          // Бараа устсан бол variantId нь null болсон байна.
          // Ийм үед хуулбарласан slug-аар тааруулна.
          { productSlug: product.slug },
        ],
      },
      select: { id: true },
    }),

    prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
      select: { id: true, rating: true, comment: true },
    }),
  ]);

  return {
    signedIn: true,
    canReview: Boolean(purchased),
    myReview,
  };
}

export type ReviewEligibility = Awaited<
  ReturnType<typeof getReviewEligibility>
>;
