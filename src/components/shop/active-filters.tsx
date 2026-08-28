"use client";

import { X } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { useShopFilters } from "@/hooks/use-shop-filters";
import type { ShopParams } from "@/lib/shop-params";

/** Идэвхтэй шүүлтүүрүүдийг жижиг шошго болгон харуулна */
export function ActiveFilters({
  params,
  categoryName,
}: {
  params: ShopParams;
  categoryName?: string;
}) {
  const { toggleValue, setValue, toggleFlag, setPriceRange, clearAll } =
    useShopFilters();

  const chips: { label: string; onRemove: () => void }[] = [];

  if (params.category) {
    chips.push({
      label: categoryName ?? params.category,
      onRemove: () => setValue("category", null),
    });
  }

  params.sizes.forEach((size) =>
    chips.push({ label: `Размер: ${size}`, onRemove: () => toggleValue("size", size) }),
  );

  params.colors.forEach((color) =>
    chips.push({ label: color, onRemove: () => toggleValue("color", color) }),
  );

  if (params.minPrice || params.maxPrice) {
    chips.push({
      label: `${params.minPrice ? formatPrice(params.minPrice) : "0₮"} — ${
        params.maxPrice ? formatPrice(params.maxPrice) : "..."
      }`,
      onRemove: () => setPriceRange("", ""),
    });
  }

  if (params.inStock)
    chips.push({ label: "Үлдэгдэлтэй", onRemove: () => toggleFlag("inStock") });
  if (params.sale)
    chips.push({ label: "Хямдралтай", onRemove: () => toggleFlag("sale") });
  if (params.featured)
    chips.push({ label: "Онцлох", onRemove: () => toggleFlag("featured") });

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.onRemove}
          className="label flex items-center gap-1.5 border border-line px-2.5 py-1.5 transition-colors hover:border-ink"
        >
          {chip.label}
          <X className="size-3" />
        </button>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="label ml-1 text-graphite underline underline-offset-4 hover:text-ink"
      >
        Бүгдийг арилгах
      </button>
    </div>
  );
}
