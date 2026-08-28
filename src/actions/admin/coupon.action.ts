"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getAdminOrThrow } from "@/lib/auth-guard";
import { isUniqueConflict } from "@/lib/prisma-errors";
import { normalizeCouponCode } from "@/lib/coupon";
import { couponFormSchema } from "@/schemas/coupon.schema";
import type { ActionResult } from "@/types";

/** Админ — купоны үйлдлүүд */

function revalidateCoupons() {
  revalidatePath("/admin/coupons");
}

/** "2026-09-01" → Date, хоосон бол null */
function toDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Маягтын утгыг database-д хадгалах хэлбэрт хөрвүүлнэ */
function toData(input: ReturnType<typeof couponFormSchema.parse>) {
  return {
    // Код үргэлж ТОМ үсгээр — "welcome10" ба "WELCOME10" ижил байх ёстой
    code: normalizeCouponCode(input.code),
    type: input.type,
    value: input.value,
    minOrder: input.minOrder ?? null,
    maxUses: input.maxUses ?? null,
    startsAt: toDate(input.startsAt),
    expiresAt: toDate(input.expiresAt),
    isActive: input.isActive,
  };
}

export async function createCouponAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await getAdminOrThrow();

  const parsed = couponFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  try {
    const coupon = await prisma.coupon.create({
      data: toData(parsed.data),
      select: { id: true },
    });

    revalidateCoupons();
    return { success: true, data: { id: coupon.id } };
  } catch (error) {
    if (isUniqueConflict(error)) {
      return { success: false, error: "Ийм кодтой купон аль хэдийн байна." };
    }
    throw error;
  }
}

export async function updateCouponAction(
  id: string,
  input: unknown,
): Promise<ActionResult<void>> {
  await getAdminOrThrow();

  const parsed = couponFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна.",
    };
  }

  try {
    await prisma.coupon.update({ where: { id }, data: toData(parsed.data) });

    revalidateCoupons();
    return { success: true, data: undefined };
  } catch (error) {
    if (isUniqueConflict(error)) {
      return { success: false, error: "Ийм кодтой купон аль хэдийн байна." };
    }
    throw error;
  }
}

/** Купоныг түр унтраах / асаах */
export async function toggleCouponAction(
  id: string,
): Promise<ActionResult<{ isActive: boolean }>> {
  await getAdminOrThrow();

  const coupon = await prisma.coupon.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!coupon) return { success: false, error: "Купон олдсонгүй." };

  const updated = await prisma.coupon.update({
    where: { id },
    data: { isActive: !coupon.isActive },
    select: { isActive: true },
  });

  revalidateCoupons();
  return { success: true, data: { isActive: updated.isActive } };
}

/**
 * Купон устгах.
 *
 * Захиалгад ашиглагдсан купоныг устгавал тэр захиалгын
 * couponId нь null болно (schema: onDelete SetNull). Хямдралын
 * дүн нь Order.discount дотор хуулбарлагдсан тул захиалга эвдрэхгүй,
 * гэхдээ "ямар купон байсан" гэдэг мэдээлэл алдагдана.
 * Тиймээс устгахын оронд УНТРААХЫГ санал болгоно.
 */
export async function deleteCouponAction(
  id: string,
): Promise<ActionResult<void>> {
  await getAdminOrThrow();

  const coupon = await prisma.coupon.findUnique({
    where: { id },
    select: { code: true, _count: { select: { orders: true } } },
  });

  if (!coupon) return { success: false, error: "Купон олдсонгүй." };

  if (coupon._count.orders > 0) {
    return {
      success: false,
      error: `"${coupon.code}" ${coupon._count.orders} захиалгад ашиглагдсан тул устгах боломжгүй. Оронд нь унтраана уу.`,
    };
  }

  await prisma.coupon.delete({ where: { id } });

  revalidateCoupons();
  return { success: true, data: undefined };
}
