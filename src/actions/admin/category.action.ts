"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getAdminOrThrow } from "@/lib/auth-guard";
import { categorySchema } from "@/schemas/product.schema";
import { isUniqueConflict } from "@/lib/prisma-errors";
import type { ActionResult } from "@/types";

/** Ангилал өөрчлөгдвөл цэс, дэлгүүр, нүүр бүгд шинэчлэгдэнэ */
function revalidateCategories() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}

function toFriendlyError(error: unknown): string {
  if (isUniqueConflict(error)) {
    return "Энэ slug аль хэдийн ашиглагдсан байна.";
  }

  throw error;
}

/** Маягтын утгыг database-д хадгалах хэлбэрт хөрвүүлнэ */
function toData(input: ReturnType<typeof categorySchema.parse>) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    image: input.image || null,
    // Хоосон мөр ирвэл "эцэггүй" гэсэн үг
    parentId: input.parentId || null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await getAdminOrThrow();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  try {
    const category = await prisma.category.create({
      data: toData(parsed.data),
      select: { id: true },
    });

    revalidateCategories();
    return { success: true, data: { id: category.id } };
  } catch (error) {
    return { success: false, error: toFriendlyError(error) };
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult<void>> {
  await getAdminOrThrow();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  // Ангилал өөрийгөө эцэгээ болгож болохгүй — хязгааргүй давталт үүснэ
  if (parsed.data.parentId === id) {
    return { success: false, error: "Ангилал өөрийгөө эцэг болгож чадахгүй." };
  }

  // Хүүхдээ эцэгээ болгож ч болохгүй
  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parsed.data.parentId },
      select: { parentId: true },
    });

    if (parent?.parentId === id) {
      return {
        success: false,
        error: "Дэд ангиллаа эцэг болгож чадахгүй.",
      };
    }
  }

  try {
    await prisma.category.update({ where: { id }, data: toData(parsed.data) });

    revalidateCategories();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toFriendlyError(error) };
  }
}

/**
 * Ангилал устгах.
 *
 * Бараатай ангиллыг устгавал тэр бараанууд "эзэнгүй" үлдэнэ —
 * database өөрөө татгалзана. Тиймээс УРЬДЧИЛЖ шалгаад
 * ойлгомжтой мессеж буцаана.
 */
export async function deleteCategoryAction(
  id: string,
): Promise<ActionResult<void>> {
  await getAdminOrThrow();

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      name: true,
      _count: { select: { products: true, children: true } },
    },
  });

  if (!category) return { success: false, error: "Ангилал олдсонгүй." };

  if (category._count.products > 0) {
    return {
      success: false,
      error: `"${category.name}" ангилалд ${category._count.products} бараа байна. Эхлээд тэдгээрийг өөр ангилалд шилжүүлнэ үү.`,
    };
  }

  if (category._count.children > 0) {
    return {
      success: false,
      error: `"${category.name}" ангилалд ${category._count.children} дэд ангилал байна. Эхлээд тэдгээрийг устгана уу.`,
    };
  }

  await prisma.category.delete({ where: { id } });

  revalidateCategories();
  return { success: true, data: undefined };
}
