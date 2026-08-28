import { z } from "zod";

/**
 * Админы купон маягт.
 *
 * Огноог ТЕКСТЭЭР авна ("2026-09-01"). Маягтын input нь текст
 * буцаадаг тул Date рүү хөрвүүлэх ажлыг Server Action хийнэ —
 * ингэснээр цагийн бүсийн эргэлзээ нэг л газар үлдэнэ.
 */
export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, { message: "Код хамгийн багадаа 3 тэмдэгт." })
      .max(24, { message: "Код хэт урт байна." })
      .regex(/^[A-Za-z0-9]+$/, {
        message: "Код зөвхөн үсэг, тоо агуулна.",
      }),

    type: z.enum(["PERCENT", "FIXED"], { message: "Төрлөө сонгоно уу." }),

    value: z
      .number({ message: "Утга тоо байх ёстой." })
      .int()
      .positive({ message: "Утга 0-ээс их байна." }),

    /** Хоосон бол доод хязгааргүй */
    minOrder: z.number().int().min(0).nullable().optional(),

    /** Хоосон бол хязгааргүй удаа хэрэглэнэ */
    maxUses: z.number().int().min(1).nullable().optional(),

    startsAt: z.string().optional(),
    expiresAt: z.string().optional(),

    isActive: z.boolean(),
  })
  // Хувиар хямдруулахад 100%-иас их байж болохгүй
  .refine((data) => data.type !== "PERCENT" || data.value <= 100, {
    message: "Хувь 100-аас их байж болохгүй.",
    path: ["value"],
  })
  // Дуусах огноо эхлэхээсээ өмнө байж болохгүй
  .refine(
    (data) =>
      !data.startsAt ||
      !data.expiresAt ||
      new Date(data.startsAt) <= new Date(data.expiresAt),
    {
      message: "Дуусах огноо эхлэх огнооноос хойш байх ёстой.",
      path: ["expiresAt"],
    },
  );

export type CouponFormInput = z.infer<typeof couponFormSchema>;
