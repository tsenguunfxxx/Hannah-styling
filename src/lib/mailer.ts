import nodemailer from "nodemailer";

/**
 * ИМЭЙЛ ИЛГЭЭХ ДАВХАРГА
 *
 * 3 горимтой. Аль нь ажиллахыг `.env` доторх EMAIL_PROVIDER шийднэ:
 *
 *   gmail  — Өөрийн Gmail хаягаараа илгээнэ (үнэгүй, өдөрт ~500 захидал).
 *            GMAIL_USER + GMAIL_APP_PASSWORD хэрэгтэй.
 *   resend — resend.com үйлчилгээгээр илгээнэ (домэйнтэй бол илүү найдвартай).
 *            RESEND_API_KEY + EMAIL_FROM хэрэгтэй.
 *   (хоосон) — ЮУ Ч ИЛГЭЭХГҮЙ. Зөвхөн terminal дээр хэвлэнэ.
 *              Хөгжүүлэлтийн үед түлхүүр байхгүй ч ажиллах боломж олгоно.
 */

export type SendResult =
  | { ok: true; delivered: boolean }
  | { ok: false; error: string };

const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase() ?? "";

/**
 * Resend-ийн туршилтын хаяг.
 *
 * Домэйнөө баталгаажуулаагүй үед ЗӨВХӨН энэ хаягаас илгээж болно.
 * Түүнээс ч гадна захидал нь Resend-д бүртгүүлсэн ӨӨРИЙН имэйл рүү
 * л хүрнэ — өөр хүн рүү илгээх гэвэл Resend 403 буцаана.
 *
 * Бодит худалдан авагчид руу илгээхийн тулд resend.com/domains дээр
 * домэйнөө баталгаажуулж, EMAIL_FROM-ыг тэр домэйны хаяг болгоно.
 */
const RESEND_TEST_FROM = "onboarding@resend.dev";

/** Хэнээс илгээж байгааг харуулах нэр, хаяг */
function fromAddress(): string {
  const name = process.env.EMAIL_FROM_NAME || "HANNAH";
  const email =
    process.env.EMAIL_FROM ||
    process.env.GMAIL_USER ||
    (provider === "resend" ? RESEND_TEST_FROM : "no-reply@hannah.mn");

  return `${name} <${email}>`;
}

// ------------------------------------------------------------
// Gmail — nodemailer + SMTP
// ------------------------------------------------------------
async function sendWithGmail(to: string, subject: string, html: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER эсвэл GMAIL_APP_PASSWORD тохируулаагүй байна.");
  }

  // Gmail-ийн ЖИРИЙН нууц үг ажиллахгүй.
  // myaccount.google.com/apppasswords хаягаас "App password" үүсгэнэ.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: pass.replace(/\s+/g, "") },
  });

  await transporter.sendMail({ from: fromAddress(), to, subject, html });
}

// ------------------------------------------------------------
// Resend — HTTP API (нэмэлт багц шаардахгүй)
// ------------------------------------------------------------
async function sendWithResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY тохируулаагүй байна.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();

    if (response.status === 401) {
      throw new Error("Resend: RESEND_API_KEY буруу байна.");
    }

    /*
      Resend өөрөө маш тодорхой алдаа буцаадаг. Жишээ нь:
      "You can only send testing emails to your own email address
      (xxx@gmail.com)". Түүнийг өөрсдийн таамаглалаар солих нь
      буруу чиглүүлнэ — эх мессежийг нь дамжуулах нь илүү тустай.
    */
    const detail = parseResendMessage(body);

    throw new Error(`Resend алдаа (${response.status}): ${detail}`);
  }
}

/** Resend-ийн JSON хариунаас уншихад ойлгомжтой мессежийг салгана */
function parseResendMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    return parsed.message ?? body.slice(0, 300);
  } catch {
    return body.slice(0, 300);
  }
}

/**
 * Имэйл илгээнэ.
 *
 * `delivered: false` гэж буцаавал ЖИНХЭНЭ имэйл яваагүй —
 * түлхүүр тохируулаагүй тул зөвхөн terminal дээр хэвлэсэн гэсэн үг.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendResult> {
  try {
    if (provider === "gmail") {
      await sendWithGmail(to, subject, html);
      return { ok: true, delivered: true };
    }

    if (provider === "resend") {
      await sendWithResend(to, subject, html);
      return { ok: true, delivered: true };
    }

    console.log(`\n📧 [EMAIL_PROVIDER тохируулаагүй] ${to} → ${subject}\n`);
    return { ok: true, delivered: false };
  } catch (error) {
    // Дэлгэрэнгүйг зөвхөн server log-д. Хэрэглэгчид ерөнхий мессеж очно.
    console.error("Имэйл илгээхэд алдаа гарлаа:", error);
    return { ok: false, error: "Имэйл илгээхэд алдаа гарлаа." };
  }
}
