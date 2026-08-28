"use client";

import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/shop-params";
import { useShopFilters } from "@/hooks/use-shop-filters";

/** Эрэмбэлэх сонголт */
export function SortSelect({ value }: { value: string }) {
  const { setValue, isPending } = useShopFilters();

  return (
    <div className="relative">
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => setValue("sort", e.target.value)}
        aria-label="Эрэмбэлэх"
        className="label w-full appearance-none border border-line bg-transparent py-2.5 pr-9 pl-3 outline-none focus-visible:border-ink sm:w-auto"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2"
      />
    </div>
  );
}
