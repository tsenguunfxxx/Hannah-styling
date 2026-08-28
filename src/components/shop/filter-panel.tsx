"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShopFilters } from "@/hooks/use-shop-filters";
import type { FilterOptions } from "@/lib/queries/shop.query";
import type { ShopParams } from "@/lib/shop-params";

/**
 * Шүүлтүүрийн самбар.
 * Desktop дээр зүүн талд, mobile дээр Sheet дотор ижил компонент ажиллана.
 */
export function FilterPanel({
  options,
  params,
}: {
  options: FilterOptions;
  params: ShopParams;
}) {
  const { toggleValue, setValue, toggleFlag, setPriceRange, clearAll, isPending } =
    useShopFilters();

  const [min, setMin] = useState(params.minPrice?.toString() ?? "");
  const [max, setMax] = useState(params.maxPrice?.toString() ?? "");

  return (
    <div className={cn("space-y-8", isPending && "opacity-60")}>
      {/* Ангилал */}
      <FilterGroup title="Ангилал">
        <ul className="space-y-1.5">
          {options.parentCategories.map((parent) => (
            <li key={parent.id}>
              <FilterButton
                active={params.category === parent.slug}
                onClick={() => setValue("category", parent.slug)}
              >
                {parent.name}
              </FilterButton>

              <ul className="mt-1 ml-3 space-y-1 border-l border-line pl-3">
                {options.childCategories
                  .filter((child) => child.parentId === parent.id)
                  .map((child) => (
                    <li key={child.id}>
                      <FilterButton
                        active={params.category === child.slug}
                        onClick={() => setValue("category", child.slug)}
                      >
                        {child.name}
                      </FilterButton>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      </FilterGroup>

      {/* Размер */}
      <FilterGroup title="Размер">
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleValue("size", size)}
              className={cn(
                "label min-w-11 border px-3 py-2 transition-colors",
                params.sizes.includes(size)
                  ? "border-ink bg-ink text-bone"
                  : "border-line hover:border-ink",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Өнгө */}
      <FilterGroup title="Өнгө">
        <div className="flex flex-wrap gap-2">
          {options.colors.map((color) => {
            const active = params.colors.includes(color.name);

            return (
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-pressed={active}
                onClick={() => toggleValue("color", color.name)}
                className={cn(
                  "flex items-center gap-2 border px-2.5 py-1.5 text-xs transition-colors",
                  active ? "border-ink" : "border-line hover:border-ink",
                )}
              >
                <span
                  style={{ backgroundColor: color.hex }}
                  className="size-3.5 border border-line"
                />
                {color.name}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Үнэ */}
      <FilterGroup title="Үнэ">
        <p className="mb-3 text-xs text-graphite">
          {formatPrice(options.minPrice)} — {formatPrice(options.maxPrice)}
        </p>

        <div className="flex items-center gap-2">
          <Input
            inputMode="numeric"
            placeholder="Хамгийн бага"
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
            className="h-9"
          />
          <span aria-hidden className="text-graphite">—</span>
          <Input
            inputMode="numeric"
            placeholder="Хамгийн их"
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
            className="h-9"
          />
        </div>

        <Button
          variant="outline"
          className="label mt-3 w-full"
          onClick={() => setPriceRange(min, max)}
        >
          Хэрэглэх
        </Button>
      </FilterGroup>

      {/* Бусад */}
      <FilterGroup title="Бусад">
        <div className="space-y-2">
          <ToggleRow
            label="Зөвхөн үлдэгдэлтэй"
            active={params.inStock}
            onClick={() => toggleFlag("inStock")}
          />
          <ToggleRow
            label="Зөвхөн хямдралтай"
            active={params.sale}
            onClick={() => toggleFlag("sale")}
          />
          <ToggleRow
            label="Онцлох бараа"
            active={params.featured}
            onClick={() => toggleFlag("featured")}
          />
        </div>
      </FilterGroup>

      <Button
        variant="outline"
        className="label w-full"
        onClick={clearAll}
      >
        <X className="size-3.5" />
        Бүх шүүлтүүрийг арилгах
      </Button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-6 last:border-0">
      <p className="label mb-3 text-graphite">{title}</p>
      {children}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "w-full text-left text-sm transition-colors",
        active ? "font-medium text-ink underline underline-offset-4" : "text-graphite hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex w-full items-center gap-3 text-left text-sm"
    >
      <span
        className={cn(
          "grid size-4 place-items-center border transition-colors",
          active ? "border-ink bg-ink" : "border-line",
        )}
      >
        {active && <span className="size-1.5 bg-bone" />}
      </span>
      <span className={active ? "text-ink" : "text-graphite"}>{label}</span>
    </button>
  );
}
