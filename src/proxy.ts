import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Next.js 16-д энэ файл өмнө нь middleware.ts гэж нэрлэгддэг байсан.
 * Хуудас ачаалагдахаас ӨМНӨ ажиллаж, эрхгүй хүнийг чиглүүлнэ.
 *
 * АНХААР: энэ бол зөвхөн эхний шүүлт (хэрэглэгчийг зөв хуудас руу явуулах).
 * Жинхэнэ хамгаалалт нь хуудас болон Server Action бүрийн дотор байна
 * (lib/auth-guard.ts-ийг үзнэ үү).
 */

/** Нэвтэрсэн хүн л орох боломжтой хуудсууд */
const PROTECTED_PREFIXES = ["/account", "/checkout", "/wishlist", "/order"];

/** Зөвхөн ADMIN орох хуудсууд */
const ADMIN_PREFIX = "/admin";

/** Нэвтэрсэн хүн орох ХЭРЭГГҮЙ хуудсууд */
const GUEST_ONLY = ["/login", "/register", "/forgot-password", "/reset-password"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();
  const user = session?.user;

  // 1. Нэвтэрсэн хүн нэвтрэх хуудас руу орох гэвэл эргүүлж явуулна.
  //    Админ бол ажлын байр нь админ хэсэг тул тийш нь.
  if (user && GUEST_ONLY.some((p) => pathname.startsWith(p))) {
    const home = user.role === "ADMIN" ? "/admin" : "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // 2. Админы хуудас
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + pathname, request.url));
    }
    if (user.role !== "ADMIN") {
      // Энгийн хэрэглэгч админ руу орж болохгүй
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Нэвтрэх шаардлагатай хуудсууд
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login?callbackUrl=" + pathname, request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Зураг, static файл, api route дээр ажиллахгүй — хурдыг хамгаална.
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
