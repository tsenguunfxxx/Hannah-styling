import { cn } from "@/lib/utils";

/**
 * Хяналтын самбарын тоон хайрцаг.
 * Том тоо, доор нь тайлбар — нэг харцаар ойлгогдоно.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Анхаарал татах ёстой тоог тодруулна */
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "border p-5",
        accent ? "border-ink bg-ink text-bone" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("label", accent ? "text-bone/60" : "text-graphite")}>
          {label}
        </p>
        <Icon className={cn("size-4 shrink-0", !accent && "text-graphite")} />
      </div>

      <p className="mt-4 font-display text-2xl tabular-nums">{value}</p>

      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            accent ? "text-bone/60" : "text-graphite",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
