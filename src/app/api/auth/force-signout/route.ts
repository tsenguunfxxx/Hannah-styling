import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * ХҮЧЭЭР ГАРАХ.
 *
 * Хэзээ хэрэгтэй вэ?
 *   Token хүчинтэй мөртлөө түүн доторх хэрэглэгч устсан үед.
 *   Ийм үед хэрэглэгч "нэвтэрсэн" мэт харагдах ч profile нь
 *   ачаалагдахгүй, бас /login руу ч орж чадахгүй болно —
 *   proxy.ts түүнийг нэвтэрсэн гэж үзээд буцаачихдаг.
 *
 * Энэ хаяг session-ий cookie-г арчаад /login руу гаргана.
 * /api доор байгаа тул proxy.ts-ийн шалгалтад орохгүй.
 */
export async function GET() {
  const cookieStore = await cookies();

  // Auth.js өөр өөр орчинд өөр нэр хэрэглэдэг:
  // authjs.session-token, __Secure-authjs.session-token, next-auth.session-token
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes("authjs") || cookie.name.includes("next-auth")) {
      cookieStore.delete(cookie.name);
    }
  }

  redirect("/login");
}
