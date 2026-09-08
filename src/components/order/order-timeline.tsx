import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";

/**
 * Хэрэглэгчид ХАРУУЛАХ алхмууд.
 *
 * "Хүлээгдэж байна", "Бэлтгэж байна" хоёрыг харуулахаа больсон —
 * хэрэглэгчид дотоод ажлын шат биш, бодит явц л сонирхолтой.
 *
 * Гэхдээ тэр хоёр төлөв өгөгдлийн санд ХЭВЭЭР байгаа (шинэ захиалга
 * бүр PENDING-ээр эхэлдэг). Тиймээс доорх STEP_INDEX нь тэдгээрийг
 * харагдах алхмуудтай тааруулж өгнө.
 */
const FLOW: OrderStatusKey[] = ["CONFIRMED", "SHIPPED", "DELIVERED"];

/**
 * Төлөв бүр аль алхам дээр байгааг заана.
 *
 *   PENDING    → -1  (эхний алхам хараахан дуусаагүй)
 *   PROCESSING →  0  ("Баталгаажсан" дээрээ хэвээр)
 */
const STEP_INDEX: Record<OrderStatusKey, number> = {
  PENDING: -1,
  CONFIRMED: 0,
  PROCESSING: 0,
  SHIPPED: 1,
  DELIVERED: 2,
  CANCELLED: -1, // доор тусад нь баригдана
};

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

  const currentIndex = STEP_INDEX[status];

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
