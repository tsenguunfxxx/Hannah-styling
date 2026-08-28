"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Тоо ширхэг сонгогч: [−] 2 [+]
 *
 * Өөрөө төлөв хадгалахгүй — эцэг компонент удирдана (controlled).
 * Ингэснээр дэлгэрэнгүй хуудас, сагс хоёр адилхан ашиглана.
 */
export function QuantityInput({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  className?: string;
}) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div
      className={cn(
        "inline-flex items-center border border-line",
        disabled && "opacity-50",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label="Тоог хасах"
        className="grid size-11 place-items-center transition-colors hover:bg-sand disabled:pointer-events-none disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>

      <span
        aria-live="polite"
        className="w-10 text-center text-sm tabular-nums"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label="Тоог нэмэх"
        className="grid size-11 place-items-center transition-colors hover:bg-sand disabled:pointer-events-none disabled:opacity-30"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
