import type { SendResult } from "@/lib/mailer";

/**
 * SMS ИЛГЭЭХ ДАВХАРГА
 *
 * Монголд SMS илгээхэд оператортой (Mobicom, Unitel, Skytel) эсвэл
 * gateway үйлчилгээтэй (messagepro.mn, sms.mn г.м) гэрээ хийх шаардлагатай.
 * Тэд бүгд өөр өөр API-тай тул ЭНД тогтмол нэг provider-т наалдахгүй,
 * `.env`-ээс тохируулж болдог хэлбэрээр бичсэн.
 *
 * SMS_PROVIDER утгууд:
 *   twilio  — Олон улсын Twilio (шууд ажиллана, төлбөртэй)
 *   custom  — Монгол gateway. SMS_API_URL руу JSON POST илгээнэ
 *   (хоосон) — ЮУ Ч ИЛГЭЭХГҮЙ, зөвхөн terminal дээр хэвлэнэ
 */

const provider = process.env.SMS_PROVIDER?.trim().toLowerCase() ?? "";

/** 8 оронтой дугаарыг олон улсын хэлбэрт оруулна: 99112233 → +97699112233 */
export function toInternational(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("976") ? `+${digits}` : `+976${digits}`;
}

// ------------------------------------------------------------
// Twilio — Basic auth-тай form POST
// ------------------------------------------------------------
async function sendWithTwilio(to: string, text: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    throw new Error("Twilio-ийн тохиргоо дутуу байна.");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toInternational(to), From: from, Body: text }),
    },
  );

  if (!response.ok) {
    throw new Error(`Twilio алдаа (${response.status}): ${await response.text()}`);
  }
}

// ------------------------------------------------------------
// Монгол gateway — ерөнхий JSON POST
// ------------------------------------------------------------
async function sendWithCustomGateway(to: string, text: string) {
  const url = process.env.SMS_API_URL;

  if (!url) {
    throw new Error("SMS_API_URL тохируулаагүй байна.");
  }

  // Талбарын нэрийг gateway бүр өөрөөр нэрлэдэг тул .env-ээс солино
  const toField = process.env.SMS_FIELD_TO || "to";
  const textField = process.env.SMS_FIELD_TEXT || "text";

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (process.env.SMS_API_KEY) {
    headers.Authorization = `Bearer ${process.env.SMS_API_KEY}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ [toField]: to, [textField]: text }),
  });

  if (!response.ok) {
    throw new Error(`SMS gateway алдаа (${response.status}): ${await response.text()}`);
  }
}

/**
 * SMS илгээнэ.
 *
 * `delivered: false` гэж буцаавал ЖИНХЭНЭ мессеж яваагүй —
 * тохиргоо хийгээгүй тул зөвхөн terminal дээр хэвлэсэн гэсэн үг.
 */
export async function sendSms(to: string, text: string): Promise<SendResult> {
  try {
    if (provider === "twilio") {
      await sendWithTwilio(to, text);
      return { ok: true, delivered: true };
    }

    if (provider === "custom") {
      await sendWithCustomGateway(to, text);
      return { ok: true, delivered: true };
    }

    console.log(`\n📱 [SMS_PROVIDER тохируулаагүй] ${to} → ${text}\n`);
    return { ok: true, delivered: false };
  } catch (error) {
    console.error("SMS илгээхэд алдаа гарлаа:", error);
    return { ok: false, error: "SMS илгээхэд алдаа гарлаа." };
  }
}
