import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";

/** Захиалгын хэвийн явц — цуцлагдсан нь энэ дараалалд ордоггүй */
const FLOW: OrderStatusKey[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

/**
 * Захиалга хаана явж байгааг харуулах зам.
 * Хэрэглэгч "одоо юу болж байна вэ?" гэдгээ нэг харцаар мэднэ.
 */
export function OrderTimeline({ status }: { status: OrderStatusKey }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 border border-sale px-4 py-3 text-sale">
        <X className="size-4 shrink-0" />
        <p className="text-sm">Энэ захиалга цуцлагдсан.</p>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <ol className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-y-4">
      {FLOW.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="flex items-center gap-2 lg:min-w-0 lg:flex-1">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border text-[10px] tabular-nums",
                isDone && "border-ink bg-ink text-bone",
                isCurrent && "border-ink text-ink",
                !isDone && !isCurrent && "border-line text-graphite",
              )}
            >
              {isDone ? <Check className="size-3" /> : index + 1}
            </span>

            <span
              className={cn(
                "label lg:truncate",
                isCurrent ? "text-ink" : "text-graphite",
              )}
            >
              {ORDER_STATUS[step].label}
            </span>

            {/* Алхмуудыг холбох зураас */}
            {index < FLOW.length - 1 && (
              <span
                className={cn(
                  "hidden h-px flex-1 lg:block",
                  isDone ? "bg-ink" : "bg-line",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
