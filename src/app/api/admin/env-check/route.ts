import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * ОРЧНЫ ХУВЬСАГЧ ШАЛГАХ — зөвхөн АДМИНД.
 *
 * Зорилго: "Vercel дээр түлхүүрээ нэмсэн үү?" гэдгийг таамаглахгүйгээр
 * ЯГ мэдэх. Локал дээр ажиллаад бодит сайт дээр ажиллахгүй бол
 * ихэвчлэн шалтгаан нь энэ байдаг.
 *
 * ⚠️ УТГЫГ НЬ ХЭЗЭЭ Ч БУЦААХГҮЙ. Зөвхөн:
 *   - байгаа эсэх (true/false)
 *   - хэдэн тэмдэгттэй
 *   - эхний хэдэн тэмдэг (sk_live_ / sk_test_ ялгахад л хангалттай)
 *
 * Ингэснээр нууц түлхүүр гадагш гарахгүй ч, буруу түлхүүр тавьсан
 * эсэхийг таньж болно.
 */
export async function GET() {
  const session = await auth();

  /*
    Админ биш бол 404. "Эрх хүрэхгүй" гэж хэлбэл энэ хаяг байгаа
    гэдгийг мэдэгдэнэ — байхгүй мэт харагдуулах нь илүү аюулгүй.
  */
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    variables: {
      DATABASE_URL: describe(process.env.DATABASE_URL),
      AUTH_SECRET: describe(process.env.AUTH_SECRET),
      NEXTAUTH_URL: describe(process.env.NEXTAUTH_URL, { showValue: true }),
      NEXT_PUBLIC_APP_URL: describe(process.env.NEXT_PUBLIC_APP_URL, {
        showValue: true,
      }),
      WIRE_SECRET_KEY: describe(process.env.WIRE_SECRET_KEY),
      WIRE_WEBHOOK_SECRET: describe(process.env.WIRE_WEBHOOK_SECRET),
      CLOUDINARY_API_SECRET: describe(process.env.CLOUDINARY_API_SECRET),
      EMAIL_PROVIDER: describe(process.env.EMAIL_PROVIDER, { showValue: true }),
      RESEND_API_KEY: describe(process.env.RESEND_API_KEY),
    },
  });
}

/**
 * Хувьсагчийг АЮУЛГҮЙ хэлбэрээр тайлбарлана.
 *
 * `showValue` нь зөвхөн нууц БИШ хувьсагчид (хаяг г.м) зориулагдсан.
 */
function describe(
  value: string | undefined,
  options?: { showValue?: boolean },
): Record<string, unknown> {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) return { set: false };

  if (options?.showValue) return { set: true, value: trimmed };

  return {
    set: true,
    length: trimmed.length,
    // Түлхүүрийн ТӨРЛИЙГ таних хэрээр л — задлахад хангалтгүй
    prefix: trimmed.slice(0, 8),
  };
}
