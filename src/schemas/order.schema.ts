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

  /*
    Имэйл нь схем дээр СОНГОЛТТОЙ.

    Нэвтэрсэн хүнээс асуухгүй — бүртгэлд нь байгаа. Харин зочноос
    ЗААВАЛ асууна, эс бөгөөс баталгаажуулах захидал явуулах,
    захиалгыг нь дараа нь олж өгөх зам үлдэхгүй.

    "Хэнээс заавал асуух вэ" гэдэг нь маягтыг хэн нээснээс хамаардаг
    тул доорх `makeCheckoutSchema`-д шийдэгдэнэ.
  */
  email: z
    .union([z.literal(""), z.email({ message: "Имэйл хаяг буруу байна." })])
    .optional(),

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

/**
 * Зочны маягтын шалгалт — имэйл ЗААВАЛ.
 *
 * Үндсэн схем дээр нэмэлт нөхцөл тавина. Ингэснээр талбаруудыг
 * хоёр удаа тодорхойлохгүй, аль нэгийг нь засаад нөгөөг нь мартах
 * эрсдэлгүй.
 */
const guestCheckoutSchema = checkoutSchema.superRefine((data, ctx) => {
  if (!data.email) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Захиалгын мэдээлэл илгээхийн тулд имэйлээ бичнэ үү.",
    });
  }
});

/**
 * Маягтыг хэн бөглөж байгаагаас хамаарч зөв шалгуурыг сонгоно.
 *
 * Client дээр нэг удаа (хэрэглэгчид шууд харуулахын тулд), сервер
 * дээр ДАХИН (жинхэнэ хамгаалалт) — хоёул ижил дүрэм ашиглана.
 */
export function makeCheckoutSchema(isGuest: boolean) {
  return isGuest ? guestCheckoutSchema : checkoutSchema;
}

export type CheckoutInput = z.infer<typeof checkoutSchema>;
