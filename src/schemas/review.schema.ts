import { z } from "zod";

/** Барааны үнэлгээ бичих маягтын шалгалт */
export const reviewSchema = z.object({
  rating: z
    .number({ message: "Оноогоо сонгоно уу." })
    .int()
    .min(1, { message: "Хамгийн багадаа 1 од." })
    .max(5, { message: "Хамгийн ихдээ 5 од." }),

  comment: z
    .string()
    .trim()
    .max(1000, { message: "Сэтгэгдэл 1000 тэмдэгтээс богино байх ёстой." })
    .optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
