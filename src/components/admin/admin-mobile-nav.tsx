"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

/** Жижиг дэлгэц дээр цэсийг хажуугаас нээнэ */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Цэс нээх"
            className="grid size-9 place-items-center text-bone lg:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 bg-bone">
        <SheetHeader>
          <SheetTitle className="label text-left text-graphite">
            Админ цэс
          </SheetTitle>
        </SheetHeader>

        <div className="px-2 pb-4">
          {/* Холбоос дармагц самбар хаагдана */}
          <AdminNavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
