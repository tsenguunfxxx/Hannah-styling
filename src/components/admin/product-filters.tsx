"use client";

import { useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryOption } from "@/lib/queries/admin/product.query";

const STATUS_OPTIONS = [
  { value: "all", label: "Бүх төлөв" },
  { value: "active", label: "Идэвхтэй" },
  { value: "inactive", label: "Нуугдсан" },
  { value: "low", label: "Үлдэгдэл багатай" },
];

/**
 * Барааны шүүлтүүр.
 *
 * Энгийн GET маягт — утгууд URL руу ордог тул хуудсыг хуваалцаж,
 * буцах товч ашиглаж болно. Сонголт солиход л маягтыг илгээх
 * жижигхэн JavaScript нэмсэн.
 */
export function ProductFilters({
  categories,
  defaults,
}: {
  categories: CategoryOption[];
  defaults: { q: string; categoryId: string; status: string };
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action="/admin/products"
      className="flex flex-wrap items-center gap-3"
    >
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-graphite" />
        <Input
          name="q"
          defaultValue={defaults.q}
          placeholder="Нэр эсвэл slug-аар хайх"
          className="pl-9"
        />
      </div>

      <Select
        name="categoryId"
        defaultValue={defaults.categoryId}
        onChange={() => formRef.current?.requestSubmit()}
      >
        <option value="">Бүх ангилал</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </Select>

      <Select
        name="status"
        defaultValue={defaults.status}
        onChange={() => formRef.current?.requestSubmit()}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Button type="submit" variant="outline" className="label h-11">
        Хайх
      </Button>
    </form>
  );
}

function Select({
  name,
  defaultValue,
  onChange,
  children,
}: {
  name: string;
  defaultValue: string;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={onChange}
        className="h-11 appearance-none border border-line bg-transparent px-3 pr-9 text-sm outline-none focus-visible:border-ink"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-graphite" />
    </div>
  );
}
