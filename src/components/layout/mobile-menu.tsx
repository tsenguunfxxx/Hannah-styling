"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, User } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/constants";
import type { CategoryTreeItem } from "@/lib/queries/category.query";

/**
 * Жижиг дэлгэц дээрх hamburger цэс.
 *
 * Хэрэглэгчийн товч navbar-аас ЭНД зөөгдсөн — жижиг дэлгэцэнд
 * дээд мөрөнд дөрвөн товч зэрэгцвэл шахуу болно. Цэсний хамгийн
 * дээр байрлуулснаар нэвтрэх нь илүү ч анзаарагдана.
 */
export function MobileMenu({
  categories,
  signedIn,
  isAdmin,
}: {
  categories: CategoryTreeItem[];
  signedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button type="button" aria-label="Цэс нээх" className="p-1 lg:hidden" />
        }
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </SheetTrigger>

      <SheetContent side="right" className="w-4/5 bg-bone sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="label text-left text-graphite">Цэс</SheetTitle>
        </SheetHeader>

        {/* Нэвтрэх — цэсний хамгийн дээр */}
        <Link
          href={signedIn ? "/account" : "/login"}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 border-y border-line px-4 py-4 text-sm"
        >
          <User className="size-5 shrink-0" strokeWidth={1.5} />
          {signedIn ? "Миний бүртгэл" : "Нэвтрэх / Бүртгүүлэх"}
        </Link>

        {/* Зөвхөн админд — ажлын хэсэг рүүгээ буцах зам */}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-b border-line px-4 py-4 text-sm"
          >
            <LayoutDashboard className="size-5 shrink-0" strokeWidth={1.5} />
            Админ хэсэг
          </Link>
        )}

        <nav className="flex flex-col gap-1 overflow-y-auto px-4 pt-6 pb-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3 font-display text-base uppercase tracking-label"
            >
              {link.label}
            </Link>
          ))}

          <p className="label mt-8 mb-2 text-graphite">Ангилал</p>

          {categories.map((category) => (
            <div key={category.id} className="border-b border-line py-3">
              <Link
                href={`/shop?category=${category.slug}`}
                onClick={() => setOpen(false)}
                className="font-display text-sm uppercase tracking-label"
              >
                {category.name}
              </Link>

              {category.children.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 pl-3">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/shop?category=${child.slug}`}
                      onClick={() => setOpen(false)}
                      className="py-1 text-sm text-graphite"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
