import { z } from "zod";
import { COUNTRYSIDE, DISTRICTS, PAYMENT_METHODS } from "@/lib/constants";

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

  district: z.enum(DISTRICTS, { message: "Дүүргээ сонгоно уу." }),

  /*
    Улаанбаатарт ЗААВАЛ, орон нутагт хоосон байж болно.
    Тиймээс энд зөвхөн уртыг шалгаад, "заавал эсэх"-ийг доорх
    `superRefine` дотор дүүргээс хамааруулж шийднэ.
  */
  addressLine: z
    .string()
    .trim()
    .max(200, { message: "Хаяг хэт урт байна." }),

  note: z
    .string()
    .trim()
    .max(500, { message: "Мэдээлэл хэт урт байна." })
    .optional(),

  paymentMethod: z.enum(paymentValues, {
    message: "Төлбөрийн аргаа сонгоно уу.",
  }),
})
  /*
    Хүргэлтийн хаягийг ХОЁР янзаар цуглуулна:

      Улаанбаатар  → "Хороо, байр, тоот" заавал
      Орон нутаг   → тэр талбар байхгүй, оронд нь дэлгэрэнгүй
                     мэдээлэл (аймаг, сум, хүлээж авах цэг) заавал

    Аль ч тохиолдолд хүргэгч хүрэх хаягтай үлдэнэ.
  */
  .superRefine((data, ctx) => {
    if (data.district === COUNTRYSIDE) {
      if (!data.note || data.note.length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["note"],
          message:
            "Аймаг, сум, хүлээж авах цэгээ дэлгэрэнгүй бичнэ үү.",
        });
      }
      return;
    }

    if (data.addressLine.length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["addressLine"],
        message: "Хороо, байр, тоотоо дэлгэрэнгүй бичнэ үү.",
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
