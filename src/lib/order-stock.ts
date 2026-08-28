import type { Prisma } from "@/generated/prisma/client";

/** Үлдэгдэл буцаахад хэрэгтэй хамгийн бага мэдээлэл */
export type RestorableItem = {
  variantId: string | null;
  quantity: number;
  variant: { productId: string } | null;
};

/**
 * Цуцлагдсан захиалгын барааг агуулах руу БУЦААНА.
 *
 * Хэрэглэгч өөрөө цуцлах, админ цуцлах хоёр газарт хэрэгтэй тул
 * нэг л газар бичсэн. Логик хоёр тийш салбарлавал нэгийг нь
 * засахад нөгөө нь мартагдана.
 *
 * ЧУХАЛ: `stockRestored` тугийг шалгах, тавих ажлыг ДУУДАГЧ хийнэ.
 * Ингэснээр үлдэгдэл хоёр удаа нэмэгдэхээс сэргийлнэ.
 */
export async function restoreOrderStock(
  tx: Prisma.TransactionClient,
  items: RestorableItem[],
): Promise<void> {
  for (const item of items) {
    // Бараа устсан бол variantId нь null болсон байна (onDelete: SetNull)
    if (!item.variantId || !item.variant) continue;

    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });

    // Цуцлагдсан захиалга "зарагдсан" гэж тооцогдохгүй
    await tx.product.update({
      where: { id: item.variant.productId },
      data: { soldCount: { decrement: item.quantity } },
    });
  }
}
