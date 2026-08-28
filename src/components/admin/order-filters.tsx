"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";

/**
 * Захиалгын шүүлтүүр.
 *
 * Төлөв нь ЭНГИЙН ХОЛБООС — JavaScript хэрэггүй, хуудсыг хуваалцаж болно.
 * Хайлт нь GET маягт тул мөн URL руу ордог.
 */
export function OrderFilters({
  active,
  q,
  counts,
  total,
}: {
  active: OrderStatusKey | "all";
  q: string;
  counts: Map<OrderStatusKey, number>;
  total: number;
}) {
  const tabs: { key: OrderStatusKey | "all"; label: string; count: number }[] = [
    { key: "all", label: "Бүгд", count: total },
    ...(Object.keys(ORDER_STATUS) as OrderStatusKey[]).map((key) => ({
      key,
      label: ORDER_STATUS[key].label,
      count: counts.get(key) ?? 0,
    })),
  ];

  return (
    <div className="space-y-4">
      <form action="/admin/orders" className="flex flex-wrap gap-3">
        {/* Төлвийг хайлт хийхэд ХАДГАЛНА */}
        {active !== "all" && (
          <input type="hidden" name="status" value={active} />
        )}

        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-graphite" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Дугаар, нэр, утсаар хайх"
            className="pl-9"
          />
        </div>

        <Button type="submit" variant="outline" className="label h-11">
          Хайх
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          // Хайлтын үг байвал төлөв солиход ч хадгална
          const params = new URLSearchParams();
          if (tab.key !== "all") params.set("status", tab.key);
          if (q) params.set("q", q);

          const query = params.toString();

          return (
            <Link
              key={tab.key}
              href={query ? `/admin/orders?${query}` : "/admin/orders"}
              aria-current={active === tab.key ? "page" : undefined}
              className={cn(
                "label border px-3 py-2 transition-colors",
                active === tab.key
                  ? "border-ink bg-ink text-bone"
                  : "border-line text-graphite hover:border-ink hover:text-ink",
              )}
            >
              {tab.label}
              <span className="ml-2 tabular-nums opacity-60">{tab.count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
