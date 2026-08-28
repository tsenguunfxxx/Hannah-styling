"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Wishlist-д нэмэх / хасах.
 * Нэвтрээгүй бол алдаа буцаана — товч дарсан хүнд toast харагдана.
 */
export async function toggleWishlistAction(productId: string) {
  const session = await auth();

  if (!session?.user) {
    return { success: false as const, error: "Эхлээд нэвтэрнэ үү." };
  }

  // Хэрэглэгчид wishlist байхгүй бол үүсгэнэ
  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
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
  const session = await auth();
  if (!session?.user) return [];

  const items = await prisma.wishlistItem.findMany({
    where: { wishlist: { userId: session.user.id } },
    select: { productId: true },
  });

  return items.map((i) => i.productId);
}
