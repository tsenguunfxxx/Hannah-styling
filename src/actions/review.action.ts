"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getReviewEligibility } from "@/lib/queries/review.query";
import { reviewSchema } from "@/schemas/review.schema";
import type { ActionResult } from "@/types";

/**
 * Сэтгэгдэл бичих / засах.
 *
 * АЮУЛГҮЙ БАЙДЛЫН ГОЛ ЦЭГ: худалдан авсан эсэхийг СЕРВЕР дээр
 * шалгана. Маягт харагдаагүй ч гэсэн хэн нэгэн энэ үйлдлийг
 * шууд дуудаж чадна.
 */
export async function saveReviewAction(
  productId: string,
  input: unknown,
): Promise<ActionResult<void>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Эхлээд нэвтэрнэ үү." };
  }

  const parsed = reviewSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  const eligibility = await getReviewEligibility(productId);

  if (!eligibility.canReview) {
    return {
      success: false,
      error: "Зөвхөн хүргэгдсэн захиалгын бараанд сэтгэгдэл бичих боломжтой.",
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (!product) return { success: false, error: "Бараа олдсонгүй." };

  // Нэг хүн нэг бараанд НЭГ сэтгэгдэл — дахин бичвэл шинэчлэгдэнэ
  await prisma.review.upsert({
    where: { productId_userId: { productId, userId: session.user.id } },
    create: {
      productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  revalidatePath(`/product/${product.slug}`);

  return { success: true, data: undefined };
}

/** Өөрийн сэтгэгдлийг устгах */
export async function deleteReviewAction(
  productId: string,
): Promise<ActionResult<void>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Эхлээд нэвтэрнэ үү." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (!product) return { success: false, error: "Бараа олдсонгүй." };

  // where дотор userId байгаа тул ӨӨРИЙН сэтгэгдлийг л устгана
  const deleted = await prisma.review.deleteMany({
    where: { productId, userId: session.user.id },
  });

  if (deleted.count === 0) {
    return { success: false, error: "Сэтгэгдэл олдсонгүй." };
  }

  revalidatePath(`/product/${product.slug}`);

  return { success: true, data: undefined };
}
