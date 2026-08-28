import { cn } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";

/**
 * Захиалгын төлвийн шошго.
 * Монгол нэрийг constants.ts-аас авна — нэг л газраас засварлана.
 */

const STYLES: Record<OrderStatusKey, string> = {
  PENDING: "border-line text-graphite",
  CONFIRMED: "border-ink text-ink",
  PROCESSING: "border-ink text-ink",
  SHIPPED: "border-ink bg-ink text-bone",
  DELIVERED: "border-ink bg-ink text-bone",
  CANCELLED: "border-sale text-sale",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatusKey;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label inline-block border px-2.5 py-1",
        STYLES[status],
        className,
      )}
    >
      {ORDER_STATUS[status].label}
    </span>
  );
}
