import { createHmac, timingSafeEqual } from "crypto";

/**
 * WIRE.MN-ТЭЙ ХАРИЛЦАХ ДАВХАРГА
 *
 * wire.mn нь Монголын төлбөрийн операторуудыг (банкны апп, хэтэвч,
 * QR, зээл) НЭГ дор нэгтгэсэн gateway. Тус бүртэй нь тусад нь
 * гэрээ хийх шаардлагагүй болдог.
 *
 * Урсгал нь 3 алхамтай:
 *   1. /v1/payment_intents        — "ийм дүнгийн төлбөр хүлээж байна" гэж бүртгүүлнэ
 *   2. /v1/checkout/sessions      — төлөх хуудасны холбоос авна
 *   3. Webhook                    — төлөгдмөгц wire.mn бидэн рүү мэдэгдэнэ
 *
 * Түлхүүр нь .env дотор, NEXT_PUBLIC_ угтваргүй тул browser руу
 * ХЭЗЭЭ Ч гарахгүй — зөвхөн сервер дээр ажиллана.
 *
 * Баримт бичиг: https://docs.wire.mn
 */

const API_BASE = "https://api.wire.mn/v1";

/** Webhook-ийн гарын үсэг ирэх толгойн нэр */
const SIGNATURE_HEADER = "wirepayment-signature";

/** Хуучин мэдэгдлийг дахин илгээх халдлагаас сэргийлэх цонх (секунд) */
const SIGNATURE_TOLERANCE_SECONDS = 300;

/**
 * Wire нь дүнг ЖИЖИГ НЭГЖЭЭР авдаг (50000 = 500.00₮).
 * Манай сан төгрөгөөр бүхэл тоогоор хадгалдаг тул 100-гаар үржүүлнэ.
 */
const MINOR_UNITS = 100;

export function toWireAmount(tugrik: number): number {
  return Math.round(tugrik * MINOR_UNITS);
}

/** Тохиргоог уншина. Түлхүүр байхгүй бол null → Wire санал болгохгүй. */
export function getWireSecretKey(): string | null {
  return process.env.WIRE_SECRET_KEY?.trim() || null;
}

/** Wire холбогдсон эсэх. Төлбөрийн сонголтод харуулах эсэхийг шийднэ. */
export function isWireConfigured(): boolean {
  return getWireSecretKey() !== null;
}

/**
 * Туршилтын түлхүүр эсэх.
 *
 * `sk_test_` угтвартай бол бодит мөнгө хөдлөхгүй. UI дээр үүнийг
 * хэрэглэгчид ил хэлэх нь зүйтэй — үгүй бол төлчихсөн гэж эндүүрнэ.
 */
export function isWireTestMode(): boolean {
  return getWireSecretKey()?.startsWith("sk_test_") ?? false;
}

// ------------------------------------------------------------
// ЕРӨНХИЙ ХҮСЭЛТ
// ------------------------------------------------------------

type WireError = {
  error?: { message?: string; code?: string; operator_decline_code?: string };
};

async function wireFetch<T>(
  path: string,
  init: { body: unknown; idempotencyKey?: string },
): Promise<T> {
  const key = getWireSecretKey();
  if (!key) throw new Error("wire.mn тохируулаагүй байна.");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  /*
    Idempotency-Key — сүлжээ тасарч дахин илгээгдвэл Wire нь эхний
    хариугаа буцаана. Ингэснээр нэг захиалгад хоёр нэхэмжлэх үүсэхгүй.
  */
  if (init.idempotencyKey) {
    headers["Idempotency-Key"] = init.idempotencyKey;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify(init.body),
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as WireError;
    throw new Error(
      `wire.mn алдаа (${response.status}): ${
        detail.error?.message ?? "тодорхойгүй"
      }`,
    );
  }

  return response.json() as Promise<T>;
}

// ------------------------------------------------------------
// PAYMENT INTENT
// ------------------------------------------------------------

export type WirePaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: WireIntentStatus;
  livemode: boolean;
};

export type WireIntentStatus =
  | "new"
  | "requires_payment_method"
  | "requires_action"
  | "requires_capture"
  | "processing"
  | "succeeded"
  | "canceled";

/**
 * Нэхэмжлэх бүртгүүлнэ.
 *
 * `metadata.order_number` нь манай захиалгын дугаар — webhook
 * ирэхэд аль захиалгынх болохыг таних түлхүүр.
 */
export async function createWireIntent(input: {
  orderNumber: string;
  amountTugrik: number;
  description: string;
}): Promise<WirePaymentIntent> {
  return wireFetch<WirePaymentIntent>("/payment_intents", {
    idempotencyKey: `order-${input.orderNumber}`,
    body: {
      amount: toWireAmount(input.amountTugrik),
      currency: "MNT",
      description: input.description.slice(0, 500),
      metadata: { order_number: input.orderNumber },
    },
  });
}

/**
 * Төлөх хуудас нээх холбоос авна.
 *
 * Hosted checkout ашиглаж байгаа тул `/confirm`-ыг ДУУДАХГҮЙ —
 * төлөх хуудас өөрөө operator сонгож, баталгаажуулна.
 */
export async function createWireCheckoutSession(input: {
  intentId: string;
  orderNumber: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  return wireFetch<{ id: string; url: string }>("/checkout/sessions", {
    idempotencyKey: `session-${input.orderNumber}`,
    body: {
      payment_intent: input.intentId,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    },
  });
}

/**
 * Нэхэмжлэхийн одоогийн төлөвийг Wire-ээс ӨӨРСДӨӨ асууна.
 *
 * Webhook ирээгүй байж болно (сүлжээ тасарсан). Мөн ирсэн webhook-д
 * бүрэн итгэхгүй — доорх callback үүгээр дахин баталгаажуулна.
 */
export async function retrieveWireIntent(
  intentId: string,
): Promise<WirePaymentIntent> {
  const key = getWireSecretKey();
  if (!key) throw new Error("wire.mn тохируулаагүй байна.");

  const response = await fetch(`${API_BASE}/payment_intents/${intentId}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`wire.mn шалгалт амжилтгүй (${response.status})`);
  }

  return response.json() as Promise<WirePaymentIntent>;
}

// ------------------------------------------------------------
// WEBHOOK — ГАРЫН ҮСГИЙН ШАЛГАЛТ
// ------------------------------------------------------------

/**
 * Мэдэгдэл үнэхээр wire.mn-ээс ирсэн эсэхийг шалгана.
 *
 * Webhook-ийн хаяг ил байдаг тул хэн ч дуудаж чадна. Гарын үсэг
 * нь зөвхөн бид болон Wire хоёрын мэдэх нууц түлхүүрээр хийгддэг
 * тул хуурамч хүсэлт энэ шалгалтыг давж чадахгүй.
 *
 * ЧУХАЛ: `rawBody` нь JSON.parse хийхээс ӨМНӨХ түүхий текст байх ёстой.
 * Задлаад буцааж бичвэл хоосон зай, талбарын дараалал өөрчлөгдөж
 * гарын үсэг таарахаа болино.
 */
export function verifyWireSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  // Толгой нь "t=1700000000,v1=abc123..." хэлбэртэй ирнэ
  const parts = new Map(
    signatureHeader.split(",").map((piece) => {
      const [key, ...rest] = piece.trim().split("=");
      return [key, rest.join("=")] as const;
    }),
  );

  const timestamp = Number(parts.get("t"));
  const received = parts.get("v1");

  if (!timestamp || !received) return false;

  // Хуучин мэдэгдлийг барьж аваад дахин илгээх халдлагаас сэргийлнэ
  const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
  if (ageSeconds > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");

  // Урт нь өөр бол timingSafeEqual алдаа шиднэ — эхэлж шалгана
  if (a.length !== b.length) return false;

  /*
    Энгийн `===` нь эхний зөрүү дээр шууд зогсдог. Хариу ирэх
    хугацааг хэмжсэнээр гарын үсгийг тэмдэгт тэмдэгтээр нь таах
    боломж үүсдэг. timingSafeEqual нь үргэлж ижил хугацаа зарцуулна.
  */
  return timingSafeEqual(a, b);
}

export { SIGNATURE_HEADER as WIRE_SIGNATURE_HEADER };

/** Webhook-ийн нууц түлхүүр (whsec_...) */
export function getWireWebhookSecret(): string | null {
  return process.env.WIRE_WEBHOOK_SECRET?.trim() || null;
}
