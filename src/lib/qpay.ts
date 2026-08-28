/**
 * QPay-тэй харилцах давхарга.
 *
 * QPay v2 API нь гурван алхамтай:
 *   1. /auth/token      — Basic auth-аар токен авна (эрх нээх)
 *   2. /invoice         — нэхэмжлэх үүсгэнэ, QR код буцаана
 *   3. /payment/check   — төлөгдсөн эсэхийг шалгана
 *
 * Мерчантын түлхүүр .env дотор. ЗӨВХӨН сервер дээр ажиллана —
 * NEXT_PUBLIC_ угтваргүй тул browser руу хэзээ ч гарахгүй.
 */

export type QpayConfig = {
  baseUrl: string;
  username: string;
  password: string;
  invoiceCode: string;
};

/** Тохиргоог уншина. Дутуу бол null → туршилтын горимд шилжинэ. */
export function getQpayConfig(): QpayConfig | null {
  const username = process.env.QPAY_USERNAME;
  const password = process.env.QPAY_PASSWORD;
  const invoiceCode = process.env.QPAY_INVOICE_CODE;

  if (!username || !password || !invoiceCode) return null;

  return {
    // Тохируулаагүй бол sandbox руу заана — санамсаргүй бодит гүйлгээ хийхээс сэргийлнэ
    baseUrl: process.env.QPAY_BASE_URL ?? "https://merchant-sandbox.qpay.mn",
    username,
    password,
    invoiceCode,
  };
}

/** QPay холбогдсон эсэх. UI-д туршилтын горим гэж харуулахад хэрэгтэй. */
export function isQpayConfigured(): boolean {
  return getQpayConfig() !== null;
}

/**
 * Токен кэш.
 *
 * QPay-ийн токен ~1 цаг хүчинтэй. Хүсэлт бүрд шинээр авбал
 * нэмэлт сүлжээний удаашрал үүснэ. Тиймээс дуусах хүртэл нь хадгална.
 */
let cachedToken: { value: string; expiresAt: number } | null = null;

/** Токен дуусахаас 60 секундын өмнө шинэчилнэ — хилийн тохиолдлоос сэргийлнэ */
const TOKEN_SAFETY_MARGIN_MS = 60_000;

async function getAccessToken(config: QpayConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const credentials = Buffer.from(
    `${config.username}:${config.password}`,
  ).toString("base64");

  const response = await fetch(`${config.baseUrl}/v2/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    // Токен хүсэлт кэшлэгдэхээс сэргийлнэ
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`QPay токен авч чадсангүй (${response.status})`);
  }

  const json: { access_token: string; expires_in: number } =
    await response.json();

  cachedToken = {
    value: json.access_token,
    // expires_in нь секундээр ирнэ
    expiresAt: Date.now() + json.expires_in * 1000 - TOKEN_SAFETY_MARGIN_MS,
  };

  return json.access_token;
}

/** Банкны аппликейшн руу шууд үсрэх холбоос */
export type QpayBankUrl = {
  name: string;
  description: string;
  logo: string;
  link: string;
};

export type QpayInvoice = {
  invoiceId: string;
  /** QR-ийн текст — уншуулах төхөөрөмжид */
  qrText: string;
  /** base64 PNG (өмнөх "data:image/png;base64," угтваргүй) */
  qrImage: string;
  /** Утсан дээрх банкны аппликейшнууд */
  bankUrls: QpayBankUrl[];
};

/**
 * Нэхэмжлэх үүсгэх.
 *
 * `senderInvoiceNo` нь манай захиалгын дугаар — QPay-ийн хариунд
 * дагалдаж ирдэг тул аль захиалгын төлбөр болохыг таньж чадна.
 */
export async function createQpayInvoice(input: {
  senderInvoiceNo: string;
  receiverCode: string;
  description: string;
  amount: number;
  callbackUrl: string;
}): Promise<QpayInvoice> {
  const config = getQpayConfig();
  if (!config) throw new Error("QPay тохируулаагүй байна.");

  const token = await getAccessToken(config);

  const response = await fetch(`${config.baseUrl}/v2/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      invoice_code: config.invoiceCode,
      sender_invoice_no: input.senderInvoiceNo,
      invoice_receiver_code: input.receiverCode,
      invoice_description: input.description,
      amount: input.amount,
      callback_url: input.callbackUrl,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`QPay нэхэмжлэх үүсгэж чадсангүй: ${detail.slice(0, 200)}`);
  }

  const json: {
    invoice_id: string;
    qr_text: string;
    qr_image: string;
    urls?: QpayBankUrl[];
  } = await response.json();

  return {
    invoiceId: json.invoice_id,
    qrText: json.qr_text,
    qrImage: json.qr_image,
    bankUrls: json.urls ?? [],
  };
}

/**
 * Төлбөр төлөгдсөн эсэхийг QPay-гээс ШАЛГАНА.
 *
 * Callback ирээгүй байж болно (сүлжээ тасарсан, хэрэглэгч хуудсаа
 * шинэчилсэн). Тиймээс бид өөрсдөө ч асууж чаддаг байх ёстой.
 */
export async function checkQpayPayment(invoiceId: string): Promise<{
  paid: boolean;
  paidAmount: number;
  transactionId: string | null;
}> {
  const config = getQpayConfig();
  if (!config) throw new Error("QPay тохируулаагүй байна.");

  const token = await getAccessToken(config);

  const response = await fetch(`${config.baseUrl}/v2/payment/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    }),
  });

  if (!response.ok) {
    throw new Error(`QPay шалгалт амжилтгүй (${response.status})`);
  }

  const json: {
    count: number;
    paid_amount: number;
    rows?: { payment_id: string; payment_status: string }[];
  } = await response.json();

  const paidRow = json.rows?.find((row) => row.payment_status === "PAID");

  return {
    paid: json.count > 0 && json.paid_amount > 0,
    paidAmount: json.paid_amount ?? 0,
    transactionId: paidRow?.payment_id ?? null,
  };
}
