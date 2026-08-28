import { randomInt } from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { sendSms } from "@/lib/sms";
import type { ResetChannel } from "@/generated/prisma/enums";

/**
 * НУУЦ ҮГ СЭРГЭЭХ КОДЫН ЛОГИК
 *
 * Аюулгүй байдлын үндсэн 5 дүрэм:
 *  1. Код нь өгөгдлийн санд hash хэлбэрээр л хадгалагдана
 *  2. 10 минутын дараа хүчингүй болно
 *  3. Хамгийн ихдээ 5 удаа буруу оруулж болно
 *  4. 60 секундэд нэгээс олон код авах боломжгүй (spam хамгаалалт)
 *  5. "Ийм хэрэглэгч байхгүй" гэж ХЭЗЭЭ Ч хэлэхгүй
 */

export const CODE_LENGTH = 6;
export const CODE_TTL_MINUTES = 10;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 60;

/** 6 оронтой санамсаргүй код. Math.random биш — crypto ашиглаж байгааг анхаар. */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(CODE_LENGTH, "0");
}

/** Имэйлийн агуулга — энгийн, уншихад ойлгомжтой */
function buildEmailHtml(code: string): string {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
      <p style="letter-spacing:.2em;font-size:12px;color:#767676;margin:0 0 24px">HANNAH STYLING</p>
      <h1 style="font-size:20px;font-weight:500;margin:0 0 12px">Нууц үг сэргээх код</h1>
      <p style="font-size:14px;line-height:1.6;color:#4a4a4a;margin:0 0 24px">
        Доорх кодыг сайт дээр оруулж шинэ нууц үгээ тохируулна уу.
      </p>
      <p style="font-size:32px;font-weight:600;letter-spacing:.3em;margin:0 0 24px">${code}</p>
      <p style="font-size:13px;line-height:1.6;color:#767676;margin:0">
        Код ${CODE_TTL_MINUTES} минутын дараа хүчингүй болно.<br />
        Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ захидлыг үл тоомсорлоно уу.
      </p>
    </div>
  `;
}

/**
 * Шинэ код үүсгээд илгээнэ.
 *
 * Буцаах утга:
 *   delivered — жинхэнэ имэйл/SMS явсан эсэх (тохиргоо хийгээгүй бол false)
 *   devCode   — зөвхөн хөгжүүлэлтийн үед, илгээх боломжгүй үед л дүүрнэ
 */
export async function issueResetCode(
  identifier: string,
  channel: ResetChannel,
): Promise<
  | { ok: true; delivered: boolean; devCode?: string }
  | { ok: false; error: string }
> {
  // 1. Хэт олон удаа дарж байна уу?
  const recent = await prisma.passwordResetCode.findFirst({
    where: { identifier, consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recent) {
    const elapsed = (Date.now() - recent.createdAt.getTime()) / 1000;

    if (elapsed < RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed);
      return { ok: false, error: `${wait} секундын дараа дахин оролдоно уу.` };
    }
  }

  // 2. Хуучин кодуудыг хүчингүй болгоно — нэг л идэвхтэй код байх ёстой
  await prisma.passwordResetCode.deleteMany({ where: { identifier } });

  const code = generateCode();

  await prisma.passwordResetCode.create({
    data: {
      identifier,
      channel,
      codeHash: await bcrypt.hash(code, 10),
      expires: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  // 3. Илгээнэ
  const result =
    channel === "EMAIL"
      ? await sendEmail(identifier, "HANNAH — Нууц үг сэргээх код", buildEmailHtml(code))
      : await sendSms(
          identifier,
          `HANNAH: Нууц үг сэргээх код ${code}. ${CODE_TTL_MINUTES} минут хүчинтэй.`,
        );

  if (!result.ok) {
    // Илгээж чадаагүй бол кодыг үлдээх нь утгагүй
    await prisma.passwordResetCode.deleteMany({ where: { identifier } });
    return { ok: false, error: result.error };
  }

  // Тохиргоо хийгээгүй үед хөгжүүлэгч туршиж чадах ёстой.
  // Production дээр ЭНЭ ХЭЗЭЭ Ч буцахгүй.
  if (!result.delivered) {
    console.log(`\n🔑 Нууц үг сэргээх код (${identifier}): ${code}\n`);

    if (process.env.NODE_ENV !== "production") {
      return { ok: true, delivered: false, devCode: code };
    }
  }

  return { ok: true, delivered: result.delivered };
}

/**
 * Оруулсан кодыг шалгана.
 *
 * Аль ч алдаанд ИЖИЛ ерөнхий мессеж буцаана — код таах гэж оролдож
 * буй хүнд "энэ хаяг бүртгэлтэй юу, код хэдэн оронтой вэ" гэдэг
 * мэдээллийг өгөхгүйн тулд.
 */
export async function verifyResetCode(
  identifier: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const generic = { ok: false as const, error: "Код буруу эсвэл хугацаа нь дууссан байна." };

  const record = await prisma.passwordResetCode.findFirst({
    where: { identifier, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return generic;

  if (record.expires < new Date() || record.attempts >= MAX_ATTEMPTS) {
    await prisma.passwordResetCode.delete({ where: { id: record.id } });
    return generic;
  }

  const matches = await bcrypt.compare(code, record.codeHash);

  if (!matches) {
    const updated = await prisma.passwordResetCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });

    // Сүүлийн оролдлого дуусвал кодыг устгана
    if (updated.attempts >= MAX_ATTEMPTS) {
      await prisma.passwordResetCode.delete({ where: { id: record.id } });
    }

    return generic;
  }

  // Зөв код — нэг удаа ашиглагдлаа гэж тэмдэглэнэ
  await prisma.passwordResetCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true };
}
