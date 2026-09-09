"use server";

import { AuthError } from "next-auth";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { getUserOrThrow } from "@/lib/auth-guard";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
  profileSchema,
  isPhoneNumber,
} from "@/schemas/auth.schema";
import { issueResetCode, verifyResetCode } from "@/lib/reset-code";
import { LOGIN_REQUIRED } from "@/lib/auth-messages";
import type { ResetChannel } from "@/generated/prisma/enums";

/**
 * Server Actions — бүгд СЕРВЕРТ ажиллана.
 * Browser дээрх шалгалтыг тойрч дуудсан ч энд дахин шалгагдана.
 */

type ActionState = { success: boolean; error?: string; info?: string };

/** Код хүссэний хариу — маягт дараагийн алхам руу шилжихэд ашиглана */
type ResetRequestState =
  | {
      success: true;
      identifier: string;
      channel: ResetChannel;
      /** Жинхэнэ имэйл/SMS явсан эсэх */
      delivered: boolean;
      /** Зөвхөн хөгжүүлэлтийн үед, илгээх тохиргоо байхгүй бол */
      devCode?: string;
    }
  | { success: false; error: string };

// ------------------------------------------------------------
// БҮРТГҮҮЛЭХ
// ------------------------------------------------------------
export async function registerAction(values: unknown): Promise<ActionState> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, phone, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { success: false, error: "Энэ имэйл хаягаар бүртгэл аль хэдийн үүссэн байна." };
  }

  // Нууц үг сэргээх код утсаар ч очдог тул дугаар давхардаж болохгүй
  if (phone) {
    const phoneTaken = await prisma.user.findUnique({ where: { phone } });

    if (phoneTaken) {
      return {
        success: false,
        error: "Энэ утасны дугаараар бүртгэл аль хэдийн үүссэн байна.",
      };
    }
  }

  // Нууц үгийг ХЭЗЭЭ Ч задгайгаар хадгалахгүй. bcrypt-ээр hash хийнэ.
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      phone: phone || null,
      password: hashedPassword,
      role: "CUSTOMER", // Шинэ хэрэглэгч ХЭЗЭЭ Ч админ болохгүй
    },
  });

  /*
    Бүртгүүлмэгц шууд нэвтрүүлнэ.

    Талбарын нэр нь `identifier` — нэвтрэх маягт утас/имэйл хоёрыг
    нэг талбараар авдаг тул энд ч мөн адил нэрээр дамжуулна.

    try/catch ЗААВАЛ хэрэгтэй. Энэ мөрөнд хүрэхэд хэрэглэгчийн
    бүртгэл АЛЬ ХЭДИЙН үүссэн байна. Хэрэв автомат нэвтрэлт ямар
    нэг шалтгаанаар бүтэлгүйтвэл (сүлжээ, session бичих алдаа г.м)
    баригдаагүй алдаа хуудсыг бүхэлд нь унагаана — хэрэглэгч
    "бүртгэл үүссэн үү, үгүй юү" гэдгээ ойлгохгүй улаан алдааны
    дэлгэц хараад үлдэнэ.
  */
  try {
    await signIn("credentials", {
      identifier: normalizedEmail,
      password,
      redirectTo: "/",
    });

    return { success: true };
  } catch (error) {
    /*
      Амжилттай нэвтрэхэд Next.js "энэ хуудас руу шилж" гэсэн
      тусгай алдаа шиддэг. Түүнийг барьж авбал шилжилт зогсоно —
      тиймээс ЗӨВХӨН нэвтрэлтийн алдааг барьж, бусдыг цааш дамжуулна.
    */
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Бүртгэл үүслээ. Одоо нэвтэрнэ үү.",
        info: LOGIN_REQUIRED,
      };
    }

    throw error;
  }
}

// ------------------------------------------------------------
// НЭВТРЭХ
// ------------------------------------------------------------
export async function loginAction(
  values: unknown,
  callbackUrl?: string,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { identifier, password } = parsed.data;

  /*
    Нэвтэрсний ДАРАА хаашаа очихыг урьдчилж шийднэ.

    Яагаад урьдчилж вэ? `signIn` нь амжилттай болмогцоо шууд redirect
    хийдэг тул дараа нь эрхийг шалгах завсар үлдэхгүй.

    Энд зөвхөн ЭРХИЙГ нь харж байгаа — нууц үгийг доорх `signIn` шалгана.
    Тиймээс буруу нууц үгтэй хүн админ руу орох боломжгүй.
  */
  const account = await prisma.user.findUnique({
    where: identifier.includes("@")
      ? { email: identifier.toLowerCase() }
      : { phone: identifier },
    select: { role: true },
  });

  // Хаанаас нэвтрэх хуудас руу ирснийг нь эхэнд тавина.
  // Жишээ: сагснаас нэвтрэх шаардсан бол буцаад сагс руугаа очно.
  const destination =
    callbackUrl || (account?.role === "ADMIN" ? "/admin" : "/");

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: destination,
    });

    return { success: true };
  } catch (error) {
    // signIn амжилттай болбол redirect алдаа шиднэ — үүнийг барихгүй, цааш дамжуулна
    if (error instanceof AuthError) {
      /*
        Аюулгүй байдлын үүднээс "ийм хэрэглэгч алга" эсвэл "нууц үг буруу"
        гэж ЯЛГАЖ хэлэхгүй. Үгүй бол хэн нэгэн дугаар, имэйл таамаглаж
        бүртгэлтэй эсэхийг мэдэж чадна.
      */
      return {
        success: false,
        error: "Утас/имэйл эсвэл нууц үг буруу байна.",
      };
    }
    throw error;
  }
}

// ------------------------------------------------------------
// ГАРАХ
// ------------------------------------------------------------
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

// ------------------------------------------------------------
// НУУЦ ҮГ СЭРГЭЭХ — 1. Код хүсэх (имэйл эсвэл утас)
// ------------------------------------------------------------
export async function forgotPasswordAction(
  values: unknown,
): Promise<ResetRequestState> {
  const parsed = forgotPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const raw = parsed.data.identifier;
  const isEmail = raw.includes("@");
  const identifier = isEmail ? raw.toLowerCase() : raw;
  const channel: ResetChannel = isEmail ? "EMAIL" : "PHONE";

  const user = isEmail
    ? await prisma.user.findUnique({ where: { email: identifier } })
    : await prisma.user.findUnique({ where: { phone: identifier } });

  /*
    Хэрэглэгч БАЙХГҮЙ ч ижил хариу буцаана.
    Үгүй бол хэн нэгэн дугаар, имэйл таамаглаж бүртгэлтэй эсэхийг мэдэж чадна.
    Гэхдээ жинхэнэ код үүсгэхгүй — 2-р алхам дээр л "код буруу" гэж хэлнэ.
  */
  if (!user) {
    return { success: true, identifier, channel, delivered: true };
  }

  const result = await issueResetCode(identifier, channel);

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    identifier,
    channel,
    delivered: result.delivered,
    devCode: result.devCode,
  };
}

// ------------------------------------------------------------
// НУУЦ ҮГ СЭРГЭЭХ — 2. Ирсэн кодыг шалгах
// ------------------------------------------------------------
export async function verifyResetCodeAction(values: unknown): Promise<ActionState> {
  const parsed = verifyCodeSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { identifier, code } = parsed.data;
  const result = await verifyResetCode(identifier, code);

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  /*
    Код зөв бол НЭГ УДААГИЙН түлхүүр үүсгэнэ.
    Кодыг URL-д тавихгүй — богино тул хуваалцахад аюултай.
    Оронд нь 64 тэмдэгттэй санамсаргүй түлхүүрийг ашиглана.
  */
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({ data: { identifier, token, expires } });

  return { success: true, info: token };
}

// ------------------------------------------------------------
// НУУЦ ҮГ СЭРГЭЭХ — 3. Шинэ нууц үг тавих
// ------------------------------------------------------------
export async function resetPasswordAction(values: unknown): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!record) {
    return { success: false, error: "Сэргээх холбоос буруу байна." };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: record.token } });
    return { success: false, error: "Сэргээх холбоосны хугацаа дууссан байна." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  /*
    `identifier` нь имэйл ЭСВЭЛ утас байж болно.
    Аль болохыг "@" тэмдгээр таньж, зөв талбараар нь хайна.
  */
  const where = isPhoneNumber(record.identifier)
    ? { phone: record.identifier }
    : { email: record.identifier };

  const user = await prisma.user.findUnique({ where, select: { id: true } });

  if (!user) {
    await prisma.verificationToken.delete({ where: { token: record.token } });
    return { success: false, error: "Бүртгэл олдсонгүй." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Түлхүүр болон үлдсэн кодуудыг цэвэрлэнэ — дахин ашиглах боломжгүй
  await prisma.verificationToken.delete({ where: { token: record.token } });
  await prisma.passwordResetCode.deleteMany({
    where: { identifier: record.identifier },
  });

  return { success: true };
}

// ------------------------------------------------------------
// ПРОФАЙЛ ЗАСАХ
// ------------------------------------------------------------
export async function updateProfileAction(values: unknown): Promise<ActionState> {
  const session = await getUserOrThrow();
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.user.update({
    // Зөвхөн ӨӨРИЙН профайлыг засна — id-г session-ээс авч байгааг анхаар
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/account");
  return { success: true };
}
