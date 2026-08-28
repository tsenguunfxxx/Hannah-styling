import Link from "next/link";
import { Heart, ShoppingBag, User } from "lucide-react";

import { auth } from "@/lib/auth";
import { NAV_LINKS } from "@/lib/constants";
import { getCategoryTree } from "@/lib/queries/category.query";
import { getCartItemCount, getWishlistCount } from "@/lib/queries/cart.query";
import { SearchDialog } from "@/components/layout/search-dialog";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Logo } from "@/components/layout/logo";

/**
 * Дэлгүүрийн үндсэн Navbar.
 * Server Component — session, ангилал, сагсны тоог шууд database-аас авна.
 * Scroll хийхэд дээрээ наалдаж үлдэнэ (sticky).
 */
export async function Navbar() {
  const [session, categories, cartCount, wishlistCount] = await Promise.all([
    auth(),
    getCategoryTree(),
    getCartItemCount(),
    getWishlistCount(),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bone/90 backdrop-blur-md">
      {/*
        Жижиг дэлгэц: лого зүүнд, товчнууд баруунд (flex justify-between).
        lg-ээс дээш: гурван багана — зүүнд лого, голд цэс, баруунд товчнууд.
        Голын багана `auto` тул цэс өөрийн өргөнөөрөө яг ГОЛ дээр зогсоно,
        зүүн баруун талын өргөн ялгаатай ч гэсэн.
      */}
      <div className="container-shop flex h-20 items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        {/* Зүүн тал — лого */}
        <Logo />

        {/* Голд — цэс */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Баруун тал — үйлдлүүд */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          {/*
            Зөвхөн АДМИНД харагдана — дэлгүүрээ хараад ажлын хэсэг рүүгээ
            нэг дарж буцах зам. Энгийн хэрэглэгчид энэ огт харагдахгүй.
          */}
          {isAdmin && (
            <Link
              href="/admin"
              className="label hidden border border-line px-3 py-1.5 transition-colors hover:border-ink lg:block"
            >
              Админ
            </Link>
          )}

          <SearchDialog />

          <Link
            href="/wishlist"
            aria-label="Хүслийн жагсаалт"
            className="relative p-1 hover:opacity-60"
          >
            <Heart className="size-[18px]" strokeWidth={1.5} />
            {wishlistCount > 0 && <Badge count={wishlistCount} />}
          </Link>

          {/*
            Жижиг дэлгэцэнд энэ товч цэсний дотор ордог тул нуугдана.
            Дээд мөрөнд дөрвөн товч зэрэгцвэл шахуу болно.
          */}
          <Link
            href={session?.user ? "/account" : "/login"}
            aria-label={session?.user ? "Миний бүртгэл" : "Нэвтрэх"}
            className="hidden p-1 hover:opacity-60 lg:block"
          >
            <User className="size-[18px]" strokeWidth={1.5} />
          </Link>

          <Link href="/cart" aria-label="Сагс" className="relative p-1 hover:opacity-60">
            <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
            {cartCount > 0 && <Badge count={cartCount} />}
          </Link>

          {/* Hamburger — хамгийн баруун талд */}
          <MobileMenu
            categories={categories}
            signedIn={Boolean(session?.user)}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </header>
  );
}

/** Icon дээрх жижиг тоо */
function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 grid size-4 place-items-center bg-ink text-[10px] leading-none text-bone tabular-nums">
      {count > 9 ? "9+" : count}
    </span>
  );
}
