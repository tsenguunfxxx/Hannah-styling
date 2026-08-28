import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata = { title: "Хуудас олдсонгүй" };

/**
 * 404 — хаяг олдсонгүй.
 *
 * Энэ хуудас root layout дотор шууд гарах тул Navbar байхгүй.
 * Тиймээс лого болон гол холбоосуудыг өөрөө агуулна — хэрэглэгч
 * гацахгүй, хаашаа явахаа мэднэ.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="label tracking-wordmark">
        {SITE.name}
      </Link>

      <p className="mt-16 font-display text-6xl tracking-label">404</p>

      <h1 className="mt-6 font-display text-2xl uppercase tracking-label">
        Хуудас олдсонгүй
      </h1>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-graphite">
        Таны хайсан хуудас устсан эсвэл хаяг нь буруу байна.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button className="label h-11" nativeButton={false} render={<Link href="/shop" />}>
          Дэлгүүр рүү очих
        </Button>

        <Button
          variant="outline"
          className="label h-11"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Нүүр хуудас
        </Button>
      </div>
    </main>
  );
}
