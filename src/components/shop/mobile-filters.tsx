"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterPanel } from "@/components/shop/filter-panel";
import type { FilterOptions } from "@/lib/queries/shop.query";
import type { ShopParams } from "@/lib/shop-params";

/** Жижиг дэлгэц дээр filter-ийг хажуугийн самбарт нээнэ */
export function MobileFilters({
  options,
  params,
  activeCount,
}: {
  options: FilterOptions;
  params: ShopParams;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" className="label lg:hidden" />}
      >
        <SlidersHorizontal className="size-3.5" />
        Шүүлтүүр
        {activeCount > 0 && (
          <span className="ml-1 bg-ink px-1.5 py-0.5 text-[10px] text-bone">
            {activeCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="left" className="w-[88%] bg-bone sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="label text-left text-graphite">Шүүлтүүр</SheetTitle>
        </SheetHeader>

        {/* Сонголтууд — гүйлгэж болно */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <FilterPanel options={options} params={params} />
        </div>

        {/*
          Доод талд наалдсан товч.
          Сонголт хийх бүрд самбар хаагдвал олон filter сонгоход төвөгтэй —
          тиймээс хэрэглэгч өөрөө хаана.
        */}
        <div className="border-t border-line bg-bone p-4">
          <Button className="label w-full" onClick={() => setOpen(false)}>
            Үр дүнг харах
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
