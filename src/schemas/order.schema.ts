import { z } from "zod";
import { DISTRICTS, PAYMENT_METHODS } from "@/lib/constants";

/**
 * Захиалга баталгаажуулах маягтын шалгалт.
 * Алдааны бичвэр бүгд монголоор — хэрэглэгч шууд ойлгоно.
 */

const paymentValues = PAYMENT_METHODS.map((m) => m.value) as [
  string,
  ...string[],
];

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, { message: "Нэрээ бүтнээр нь бичнэ үү." })
    .max(60, { message: "Нэр хэт урт байна." }),

  // Монголын утасны дугаар — 8 орон
  phone: z
    .string()
    .trim()
    .regex(/^\d{8}$/, { message: "Утасны дугаар 8 оронтой байх ёстой." }),

  // Имэйл заавал биш. Бичсэн бол зөв хэлбэртэй байх ёстой.
  email: z
    .union([z.literal(""), z.email({ message: "Имэйл хаяг буруу байна." })])
    .optional(),

  district: z.enum(DISTRICTS, { message: "Дүүргээ сонгоно уу." }),

  addressLine: z
    .string()
    .trim()
    .min(5, { message: "Хороо, байр, тоотоо дэлгэрэнгүй бичнэ үү." })
    .max(200, { message: "Хаяг хэт урт байна." }),

  note: z
    .string()
    .trim()
    .max(300, { message: "Тэмдэглэл хэт урт байна." })
    .optional(),

  paymentMethod: z.enum(paymentValues, {
    message: "Төлбөрийн аргаа сонгоно уу.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
