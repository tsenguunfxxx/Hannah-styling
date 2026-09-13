import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * ЗОЧНЫ ЗАХИАЛГЫГ ТАНИХ.
 *
 * Бүртгэлгүй хүн захиалга хийж болно. Гэтэл дараа нь "энэ захиалга
 * үнэхээр чинийх мөн үү?" гэдгийг ЯАЖ мэдэх вэ? Бүртгэл байхгүй тул
 * `userId` алга.
 *
 * ШИЙДЭЛ: захиалга үүсмэгц түүний дугаарыг зочны хөтөч дээр cookie
 * болгон үлдээнэ. Дараа нь захиалгын хуудас руу орох, төлбөр төлөх,
 * цуцлах бүрд тэр cookie-г шалгана.
 *
 * ⚠️ ЯАГААД ГАРЫН ҮСЭГ ЗУРАХ ШААРДЛАГАТАЙ ВЭ?
 *
 *   Захиалгын дугаар нь HN-0001, HN-0002 гэж ДАРААЛЛААР явдаг —
 *   өөрөөр хэлбэл таамаглахад амархан. Хэрэв cookie дотор зөвхөн
 *   дугаар байсан бол хэн ч өөрийн хөтөч дээрээ "HN-0005" гэж бичээд
 *   бусдын захиалгыг нээж үзэх байсан. (httpOnly нь хуудасны
 *   JavaScript-ээс хамгаалдаг ч, өөрийн хөтчөө удирдаж байгаа хүнийг
 *   зогсоохгүй.)
 *
 *   Тиймээс агуулгыг СЕРВЕРИЙН нууц түлхүүрээр тамгална. Тамга нь
 *   зөвхөн сервер дээр байгаа `AUTH_SECRET`-ээс үүсэх тул гаднаас
 *   хуурамчаар үйлдэх боломжгүй.
 */

/** Зочны захиалгуудыг санах cookie */
const GUEST_ORDER_COOKIE = "hannah_orders";

/** 90 хоног — зочин захиалгаа хянах хангалттай хугацаа */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

/**
 * Хамгийн ихдээ санах захиалгын тоо.
 * Cookie бүр хүсэлт тутам сервер рүү явдаг тул хязгааргүй ургуулж
 * болохгүй. Хэтэрвэл ХАМГИЙН ХУУЧНЫГ нь хаяна.
 */
const MAX_REMEMBERED = 20;

function getSecret(): string | null {
  return process.env.AUTH_SECRET?.trim() || null;
}

/** Агуулгын тамга — зөвхөн серверийн нууц түлхүүрээр үүснэ */
function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Тамга зөв эсэх.
 *
 * `timingSafeEqual` ашигласан нь санамсаргүй биш: энгийн `===` нь
 * эхний зөрүүтэй тэмдэгт дээрээ зогсдог тул хариу ирэх хугацааг
 * хэмжин тамгыг тэмдэгт тэмдэгтээр нь таах онолын боломж үүсдэг.
 */
function verify(payload: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);

  // Урт нь зөрвөл timingSafeEqual шидэх тул эхлээд шалгана
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

/** Cookie доторх бүх захиалгын дугаар. Тамга буруу бол хоосон. */
export async function getGuestOrderNumbers(): Promise<string[]> {
  const secret = getSecret();
  if (!secret) return [];

  const raw = (await cookies()).get(GUEST_ORDER_COOKIE)?.value;
  if (!raw) return [];

  // Хэлбэр: <base64 агуулга>.<тамга>
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return [];

  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);

  if (!verify(payload, signature, secret)) return [];

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

/** Энэ зочин тухайн захиалгыг үүсгэсэн эсэх */
export async function ownsGuestOrder(orderNumber: string): Promise<boolean> {
  const numbers = await getGuestOrderNumbers();
  return numbers.includes(orderNumber);
}

/**
 * Шинэ захиалгыг зочны cookie-д нэмнэ.
 *
 * Server Action дотроос л дуудагдана — Server Component-оос cookie
 * бичих боломжгүй.
 */
export async function rememberGuestOrder(orderNumber: string): Promise<void> {
  const secret = getSecret();

  if (!secret) {
    // Түлхүүргүй бол тамгалж чадахгүй тул огт бичихгүй нь дээр
    console.error("AUTH_SECRET алга — зочны захиалгыг сануулж чадсангүй.");
    return;
  }

  const current = await getGuestOrderNumbers();

  // Давхардвал дахин нэмэхгүй, шинийг нь ЭХЭНД нь тавина
  const next = [orderNumber, ...current.filter((n) => n !== orderNumber)].slice(
    0,
    MAX_REMEMBERED,
  );

  const payload = Buffer.from(JSON.stringify(next), "utf8").toString(
    "base64url",
  );

  (await cookies()).set(GUEST_ORDER_COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}
