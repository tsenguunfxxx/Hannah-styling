import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Оддын үнэлгээ. Зөвхөн харуулна — дарж болохгүй.
 * (Үнэлгээ өгөх маягт PHASE 14-д нэмэгдэнэ.)
 */
export function StarRating({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const rounded = Math.round(rating);

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`5-аас ${rating.toFixed(1)} оноо`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={cn(
            size === "lg" ? "size-4.5" : "size-3.5",
            star <= rounded ? "fill-ink stroke-ink" : "stroke-line",
          )}
        />
      ))}
    </div>
  );
}
