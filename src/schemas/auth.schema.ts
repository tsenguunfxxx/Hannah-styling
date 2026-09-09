import { z } from "zod";

/**
 * Формын шалгалт (validation).
 * Алдааны мессежийг МОНГОЛ хэлээр бичнэ — хэрэглэгч шууд ойлгоно.
 *
 * Энэ schema-г 2 газар ашиглана:
 *  1. Browser дээр — React Hook Form шууд улаан бичиг харуулна
 *  2. Server дээр — хэн нэгэн browser-ийг тойрч дуудсан ч дахин шалгана
 */

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Нэр дор хаяж 2 үсэгтэй байх ёстой." })
      .max(50, { message: "Нэр хэт урт байна." }),
    email: z.email({ message: "Имэйл хаяг буруу байна." }),
    phone: z
      .string()
      .regex(/^[0-9]{8}$/, { message: "Утасны дугаар 8 оронтой тоо байна." })
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, { message: "Нууц үг дор хаяж 8 тэмдэгттэй байна." })
      .regex(/[a-z]/, { message: "Нууц үгэнд жижиг үсэг орсон байх ёстой." })
      .regex(/[A-Z]/, { message: "Нууц үгэнд том үсэг орсон байх ёстой." })
      .regex(/[0-9]/, { message: "Нууц үгэнд тоо орсон байх ёстой." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Нууц үг таарахгүй байна.",
    path: ["confirmPassword"], // алдааг энэ талбар дээр харуулна
  });

/** Утасны дугаар мөн эсэх — 8 оронтой тоо */
export function isPhoneNumber(value: string): boolean {
  return /^\d{8}$/.test(value.trim());
}

/**
 * Нэвтрэх — ЗӨВХӨН ИМЭЙЛЭЭР.
 *
 * Утсаар нэвтрэх боломжийг хассан. Шалтгаан нь: бүртгэлд имэйл
 * ЗААВАЛ, утас нь СОНГОЛТ. Тиймээс утсаар нэвтрэх зам зөвхөн
 * заримд нь ажилладаг байв — нэг л найдвартай зам үлдээв.
 *
 * Талбарын нэр `identifier` хэвээр үлдсэн: Auth.js провайдер,
 * бүртгэлийн дараах автомат нэвтрэлт хоёул үүнийг ашигладаг.
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Имэйл хаягаа оруулна уу." })
    .refine((value) => z.email().safeParse(value).success, {
      message: "Имэйл хаяг буруу байна.",
    }),
  password: z.string().min(1, { message: "Нууц үгээ оруулна уу." }),
});

/**
 * Нууц үг сэргээх — 1-р алхам: код хүсэх.
 *
 * Нэвтрэх маягттай адил НЭГ талбар ашиглана. "@" тэмдэг байвал
 * имэйл, үгүй бол утас гэж үзнэ.
 */
export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Утасны дугаар эсвэл имэйлээ оруулна уу." })
    .refine(
      (value) =>
        value.includes("@")
          ? z.email().safeParse(value).success
          : isPhoneNumber(value),
      { message: "Утасны дугаар 8 оронтой эсвэл имэйл хаяг байх ёстой." },
    ),
});

/** Нууц үг сэргээх — 2-р алхам: ирсэн кодыг шалгах */
export const verifyCodeSchema = z.object({
  identifier: z.string().trim().min(1),
  code: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, { message: "Код 6 оронтой тоо байна." }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Сэргээх код олдсонгүй." }),
    password: z
      .string()
      .min(8, { message: "Нууц үг дор хаяж 8 тэмдэгттэй байна." })
      .regex(/[a-z]/, { message: "Нууц үгэнд жижиг үсэг орсон байх ёстой." })
      .regex(/[A-Z]/, { message: "Нууц үгэнд том үсэг орсон байх ёстой." })
      .regex(/[0-9]/, { message: "Нууц үгэнд тоо орсон байх ёстой." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Нууц үг таарахгүй байна.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Нэр дор хаяж 2 үсэгтэй байх ёстой." })
    .max(50, { message: "Нэр хэт урт байна." }),
  phone: z
    .string()
    .regex(/^[0-9]{8}$/, { message: "Утасны дугаар 8 оронтой тоо байна." })
    .optional()
    .or(z.literal("")),
});

// Формын утгуудын TypeScript төрлийг schema-гаас АВТОМАТААР гаргаж авна
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
