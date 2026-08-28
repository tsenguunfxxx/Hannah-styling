"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useShopFilters } from "@/hooks/use-shop-filters";

/** Хуудаслалт */
export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const { goToPage, isPending } = useShopFilters();

  if (totalPages <= 1) return null;

  // Одоогийн хуудсын эргэн тойрны дугааруудыг харуулна
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav
      aria-label="Хуудаслалт"
      className={cn("mt-14 flex items-center justify-center gap-1.5", isPending && "opacity-60")}
    >
      <PageButton
        disabled={page === 1}
        onClick={() => goToPage(page - 1)}
        aria-label="Өмнөх хуудас"
      >
        <ChevronLeft className="size-4" />
      </PageButton>

      {pages.map((p, index) => (
        <span key={p} className="flex items-center gap-1.5">
          {index > 0 && p - pages[index - 1] > 1 && (
            <span className="label px-1 text-graphite">…</span>
          )}
          <PageButton active={p === page} onClick={() => goToPage(p)}>
            {p}
          </PageButton>
        </span>
      ))}

      <PageButton
        disabled={page === totalPages}
        onClick={() => goToPage(page + 1)}
        aria-label="Дараагийн хуудас"
      >
        <ChevronRight className="size-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  active,
  disabled,
  onClick,
  children,
  ...props
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "label grid size-9 place-items-center border transition-colors disabled:opacity-30",
        active ? "border-ink bg-ink text-bone" : "border-line hover:border-ink",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
