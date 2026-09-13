import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { rememberGuestOrder, verifyOrderToken } from "@/lib/guest-orders";

/**
 * ЗАХИДЛААС ЗАХИАЛГА НЭЭХ.
 *
 * Баталгаажуулах имэйл дэх холбоос энэ хаяг руу ирнэ:
 *   /api/order/HN-0007/open?t=<тамга>
 *
 * ЯАГААД ШУУД /order/HN-0007 РУУ ХОЛБОХГҮЙ ВЭ?
 *
 *   Зочны захиалгыг cookie-гоор таьдаг. Гэтэл захидлыг өөр
 *   төхөөрөмж дээр нээж болно — компьютер дээр захиалаад утсан дээрээ
 *   имэйлээ уншихад тэр хөтөч дээр cookie байхгүй тул "захиалга
 *   олдсонгүй" гэж гарах байлаа.
 *
 *   Тиймээс энэ хаяг тамгыг шалгаад, тухайн хөтөч дээр cookie-г нь
 *   ТАВЬЖ өгөөд захиалгын хуудас руу залгуулна. Цаашид тэр
 *   төхөөрөмж дээрээс төлбөр төлөх, цуцлах бүгд ажиллана.
 *
 *   Cookie бичих шаардлагатай тул Server Component биш, route
 *   handler байх ёстой — Server Component cookie тавьж чаддаггүй.
 *
 * Энэ хаяг /api доор байгаа тул proxy.ts-ийн шалгалтад орохгүй.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const token = request.nextUrl.searchParams.get("t") ?? undefined;

  const orderUrl = new URL(`/order/${orderNumber}`, request.url);

  if (!verifyOrderToken(orderNumber, token)) {
    /*
      Тамга буруу бол шууд захиалгын хуудас руу явуулна. Тэнд
      эрхийн шалгалт дахин хийгдэнэ: нэвтэрсэн эзэн нь бол харна,
      бусад тохиолдолд "олдсонгүй" гэж гарна. Энд тусад нь алдаа
      харуулбал "энэ дугаартай захиалга байна" гэдгийг мэдэгдэнэ.
    */
    return NextResponse.redirect(orderUrl);
  }

  /*
    Тамга зөв ч захиалга үнэхээр байгаа эсэхийг шалгана — устсан
    захиалгын хуучин холбоосоор cookie бохирдуулах хэрэггүй.

    Зөвхөн ЗОЧНЫ захиалгад cookie тавина. Бүртгэлтэй захиалгын эзэн
    нь тодорхой тул нэвтэрч орох нь зөв зам.
  */
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { userId: true },
  });

  if (order && order.userId === null) {
    await rememberGuestOrder(orderNumber);
  }

  return NextResponse.redirect(orderUrl);
}
