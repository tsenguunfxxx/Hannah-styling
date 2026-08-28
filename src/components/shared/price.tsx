import { cn, formatPrice, discountPercent } from "@/lib/utils";

/**
 * Үнэ харуулах нэгдсэн компонент.
 * Хямдралтай бол: шинэ үнэ + хуучин үнэ (зураастай) + хувь
 */
export function Price({
  basePrice,
  discountPrice,
  size = "sm",
  showPercent = false,
  className,
}: {
  basePrice: number;
  discountPrice?: number | null;
  size?: "sm" | "lg";
  showPercent?: boolean;
  className?: string;
}) {
  const hasDiscount = Boolean(discountPrice && discountPrice < basePrice);
  const percent = hasDiscount ? discountPercent(basePrice, discountPrice!) : 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-1",
        size === "lg" ? "text-lg" : "text-sm",
        className,
      )}
    >
      <span className="font-medium tabular-nums">
        {formatPrice(hasDiscount ? discountPrice! : basePrice)}
      </span>

      {hasDiscount && (
        <span className="text-graphite line-through tabular-nums">
          {formatPrice(basePrice)}
        </span>
      )}

      {hasDiscount && showPercent && (
        <span className="label text-sale">-{percent}%</span>
      )}
    </div>
  );
}
