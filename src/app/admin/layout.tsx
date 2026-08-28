import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { requireAdmin } from "@/lib/auth-guard";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { LogoutButton } from "@/components/auth/logout-button";

/**
 * АДМИНЫ LAYOUT.
 *
 * requireAdmin() ЭНД дуудагдаж байгаа тул /admin доорх БҮХ хуудас
 * автоматаар хамгаалагдана. Шинэ админ хуудас нэмэхэд эрхийн
 * шалгалтыг дахин бичих шаардлагагүй.
 *
 * proxy.ts дээр ч мөн шалгалт байгаа — тэр нь хурдан шүүлт,
 * ЭНЭ нь жинхэнэ хамгаалалт.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col">
      {/* Дээд мөр */}
      <header className="sticky top-0 z-30 border-b border-ink bg-ink text-bone">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <AdminMobileNav />

          <Link href="/admin" className="label tracking-wordmark">
            HANNAH
          </Link>
          <span className="label text-bone/50">Админ</span>

          <div className="ml-auto flex items-center gap-4">
            <span className="label hidden text-bone/60 sm:block">
              {session.user.email}
            </span>

            {/*
              ШИНЭ ТАБ-д нээнэ. Ингэснээр админы таб хэвээрээ үлдэх тул
              дэлгүүрээ хараад буцахад дахин нэвтрэх, хайх шаардлагагүй.
              Хажуугийн ⧉ тэмдэг нь "шинэ цонх" гэдгийг илэрхийлнэ.
            */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex items-center gap-1.5 text-bone/70 transition-colors hover:text-bone"
            >
              Дэлгүүр
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Хажуугийн цэс — зөвхөн том дэлгэцэнд */}
        <aside className="hidden w-60 shrink-0 border-r border-line lg:block">
          <div className="sticky top-14 flex h-[calc(100svh-3.5rem)] flex-col p-3">
            <AdminNavLinks />

            <div className="mt-auto border-t border-line pt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
