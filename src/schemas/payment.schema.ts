import { z } from "zod";

/**
 * Төлбөртэй холбоотой шалгалтууд.
 * Хэрэглэгчийн оруулсан гүйлгээний дугаарыг цэвэрлэж авна.
 */
export const bankTransferSchema = z.object({
  transactionId: z
    .string()
    .trim()
    .min(4, { message: "Гүйлгээний дугаар хамгийн багадаа 4 тэмдэгт." })
    .max(60, { message: "Гүйлгээний дугаар хэт урт байна." }),
});

export type BankTransferInput = z.infer<typeof bankTransferSchema>;
