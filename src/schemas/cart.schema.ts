import { z } from "zod";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/constants";

/**
 * Сагстай холбоотой шалгалтууд.
 *
 * ЧУХАЛ: Client дээр товч disabled байсан ч хэрэглэгч сервер рүү
 * гараар хүсэлт илгээж чадна. Тиймээс сервер дээр ДАХИН шалгана.
 */
export const addToCartSchema = z.object({
  variantId: z.string().min(1, { message: "Размер, өнгөө сонгоно уу." }),
  quantity: z.coerce
    .number({ message: "Тоо ширхэг буруу байна." })
    .int({ message: "Тоо ширхэг бүхэл тоо байх ёстой." })
    .min(1, { message: "Хамгийн багадаа 1 ширхэг." })
    .max(MAX_QUANTITY_PER_ITEM, {
      message: `Нэг удаад хамгийн ихдээ ${MAX_QUANTITY_PER_ITEM} ширхэг авах боломжтой.`,
    }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

/** Сагсны мөрийн тоо ширхэгийг өөрчлөх */
export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, { message: "Мөр олдсонгүй." }),
  quantity: z.coerce
    .number({ message: "Тоо ширхэг буруу байна." })
    .int({ message: "Тоо ширхэг бүхэл тоо байх ёстой." })
    .min(1, { message: "Хамгийн багадаа 1 ширхэг." })
    .max(MAX_QUANTITY_PER_ITEM, {
      message: `Нэг бараанаас хамгийн ихдээ ${MAX_QUANTITY_PER_ITEM} ширхэг авах боломжтой.`,
    }),
});

/** Сагснаас мөр хасах */
export const removeCartItemSchema = z.object({
  itemId: z.string().min(1, { message: "Мөр олдсонгүй." }),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
