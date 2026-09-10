"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getVerifiedUserId } from "@/lib/auth-guard";

/**
 * Wishlist-д нэмэх / хасах.
 * Нэвтрээгүй бол алдаа буцаана — товч дарсан хүнд toast харагдана.
 */
export async function toggleWishlistAction(productId: string) {
  /*
    `session.user.id`-г ШУУД биш, шалгаж авна.

    Cookie доторх нэвтрэлт 30 хоног хүчинтэй. Тэр хугацаанд бүртгэл
    уствал cookie нь хүчинтэй хэвээр үлдэж, доорх `upsert` нь
    байхгүй хэрэглэгч рүү заасан мөр бичих гэж оролдоод өгөгдлийн
    сан "Foreign key constraint violated" гэж хаядаг байв —
    хэрэглэгчид улаан алдааны дэлгэц гарна.
  */
  const userId = await getVerifiedUserId();

  if (!userId) {
    return { success: false as const, error: "Эхлээд нэвтэрнэ үү." };
  }

  // Хэрэглэгчид wishlist байхгүй бол үүсгэнэ
  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { success: true as const, added: false };
  }

  await prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId },
  });

  revalidatePath("/wishlist");
  return { success: true as const, added: true };
}

/** Тухайн хэрэглэгчийн wishlist-д байгаа барааны id-ууд */
export async function getWishlistProductIds(): Promise<string[]> {
  /*
    Энд зөвхөн УНШИНА — байхгүй хэрэглэгчийн id-гаар хайхад юу ч
    олдохгүй, алдаа ч гарахгүй. Тиймээс нэмэлт асуулга шаардлагагүй.
  */
  const session = await auth();
  if (!session?.user) return [];

  const items = await prisma.wishlistItem.findMany({
    where: { wishlist: { userId: session.user.id } },
    select: { productId: true },
  });

  return items.map((i) => i.productId);
}
