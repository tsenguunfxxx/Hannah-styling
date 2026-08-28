"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getAdminOrThrow } from "@/lib/auth-guard";
import { productSchema } from "@/schemas/product.schema";
import {
  getUniqueConflictFields,
  isUniqueConflict,
} from "@/lib/prisma-errors";
import type { ActionResult } from "@/types";

/**
 * Админ — барааны үйлдлүүд.
 *
 * Функц БҮР эхлээд getAdminOrThrow() дуудна.
 * layout.tsx дээрх шалгалт нь ЗӨВХӨН хуудсыг хамгаална —
 * Server Action-ыг шууд дуудаж болдог тул энд дахин шалгана.
 */

/** Дэлгүүрийн кэшлэгдсэн хуудсуудыг шинэчилнэ */
function revalidateShop(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/product/${slug}`);
}

/** Давхардсан утгын алдааг ойлгомжтой мессеж болгоно */
function toFriendlyError(error: unknown): string {
  if (isUniqueConflict(error)) {
    const fields = getUniqueConflictFields(error);

    if (fields.includes("slug")) {
      return "Энэ slug аль хэдийн ашиглагдсан байна. Өөр slug сонгоно уу.";
    }

    if (fields.includes("sku")) {
      return "Энэ SKU аль хэдийн ашиглагдсан байна.";
    }

    if (fields.includes("size") || fields.includes("color")) {
      return "Ижил размер, өнгөний хослол давхардсан байна.";
    }

    return "Давхардсан утга байна.";
  }

  // Танихгүй алдааг нуухгүй — дээшээ дамжуулна
  throw error;
}

// ------------------------------------------------------------
// ШИНЭ БАРАА
// ------------------------------------------------------------
export async function createProductAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await getAdminOrThrow();

  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  const data = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        details: data.details || null,
        basePrice: data.basePrice,
        discountPrice: data.discountPrice ?? null,

        // ЭНЭ МӨРИЙГ МАРТВАЛ дэлгүүрийн үнийн эрэмбэ, шүүлтүүр эвдэрнэ
        effectivePrice: data.discountPrice ?? data.basePrice,

        categoryId: data.categoryId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,

        images: {
          create: data.images.map((image, index) => ({
            url: image.url,
            publicId: image.publicId || null,
            alt: image.alt || data.name,
            // Эхний зураг үндсэн, хоёр дахь нь hover зураг
            sortOrder: index,
          })),
        },

        variants: {
          create: data.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            stock: variant.stock,
            sku: variant.sku || null,
            price: variant.price ?? null,
          })),
        },
      },
      select: { id: true },
    });

    revalidateShop(data.slug);

    return { success: true, data: { id: product.id } };
  } catch (error) {
    return { success: false, error: toFriendlyError(error) };
  }
}

// ------------------------------------------------------------
// БАРАА ЗАСАХ
// ------------------------------------------------------------
export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await getAdminOrThrow();

  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  const data = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, variants: { select: { id: true } } },
  });

  if (!existing) return { success: false, error: "Бараа олдсонгүй." };

  // Маягтад үлдсэн variant-уудын id
  const keptIds = new Set(
    data.variants.map((v) => v.id).filter(Boolean) as string[],
  );

  // Маягтаас хасагдсан variant-ууд
  const removedIds = existing.variants
    .map((v) => v.id)
    .filter((variantId) => !keptIds.has(variantId));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          details: data.details || null,
          basePrice: data.basePrice,
          discountPrice: data.discountPrice ?? null,
          effectivePrice: data.discountPrice ?? data.basePrice,
          categoryId: data.categoryId,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
        },
      });

      // Зургийг бүхэлд нь дахин бичнэ.
      // ProductImage-д өөр хүснэгт холбогдоогүй тул аюулгүй.
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: data.images.map((image, index) => ({
          productId: id,
          url: image.url,
          publicId: image.publicId || null,
          alt: image.alt || data.name,
          sortOrder: index,
        })),
      });

      // Хасагдсан variant-ууд.
      // Захиалгын мөр нь SetNull тул ХУУЧИН ЗАХИАЛГА эвдрэхгүй —
      // нэр, үнэ нь OrderItem дотор хуулбарлагдсан байгаа.
      if (removedIds.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: removedIds } } });
      }

      for (const variant of data.variants) {
        const payload = {
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          stock: variant.stock,
          sku: variant.sku || null,
          price: variant.price ?? null,
        };

        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: payload,
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, ...payload },
          });
        }
      }
    });

    revalidateShop(data.slug);
    // Slug өөрчлөгдсөн бол хуучин хаягийг ч шинэчилнэ
    if (existing.slug !== data.slug) revalidatePath(`/product/${existing.slug}`);

    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: toFriendlyError(error) };
  }
}

// ------------------------------------------------------------
// ИДЭВХТЭЙ / ИДЭВХГҮЙ
// ------------------------------------------------------------
/**
 * Барааг дэлгүүрээс түр нуух.
 * Устгахаас хамаагүй аюулгүй — өгөгдөл бүрэн үлдэнэ.
 */
export async function toggleProductActiveAction(
  id: string,
): Promise<ActionResult<{ isActive: boolean }>> {
  await getAdminOrThrow();

  const product = await prisma.product.findUnique({
    where: { id },
    select: { isActive: true, slug: true },
  });

  if (!product) return { success: false, error: "Бараа олдсонгүй." };

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
    select: { isActive: true },
  });

  revalidateShop(product.slug);

  return { success: true, data: { isActive: updated.isActive } };
}

// ------------------------------------------------------------
// УСТГАХ
// ------------------------------------------------------------
/**
 * Барааг бүрмөсөн устгах.
 *
 * Зураг, variant, сэтгэгдэл нь cascade-аар хамт устана.
 * ХУУЧИН ЗАХИАЛГА эвдрэхгүй — OrderItem дотор барааны нэр, үнэ
 * хуулбарлагдсан, variantId нь зүгээр л null болно.
 */
export async function deleteProductAction(
  id: string,
): Promise<ActionResult<void>> {
  await getAdminOrThrow();

  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!product) return { success: false, error: "Бараа олдсонгүй." };

  await prisma.product.delete({ where: { id } });

  revalidateShop(product.slug);

  return { success: true, data: undefined };
}
