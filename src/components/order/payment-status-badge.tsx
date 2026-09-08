import { Check, Clock, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { PAYMENT_STATUS, type PaymentStatusKey } from "@/lib/constants";

/**
 * Төлбөрийн төлвийн шошго.
 *
 * Захиалгын төлвийн шошготой ижил зарчмаар — өнгө нь утгыг
 * илэрхийлнэ. Хамгийн чухал нь ТӨЛӨГДСӨН: хэрэглэгч ч, админ ч
 * энэ мэдээллийг хамгийн түрүүнд хайдаг тул ногооноор тодруулна.
 */
const STYLES: Record<PaymentStatusKey, string> = {
  PENDING: "border-line text-graphite",
  PAID: "border-success/40 bg-success/10 text-success",
  FAILED: "border-sale/40 bg-sale/10 text-sale",
  REFUNDED: "border-pending/40 bg-pending/10 text-pending",
};

const ICONS: Record<PaymentStatusKey, typeof Check> = {
  PENDING: Clock,
  PAID: Check,
  FAILED: X,
  REFUNDED: RotateCcw,
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatusKey;
  className?: string;
}) {
  const Icon = ICONS[status];

  return (
    <span
      className={cn(
        "label inline-flex items-center gap-1.5 border px-2.5 py-1",
        STYLES[status],
        className,
      )}
    >
      <Icon className="size-3 shrink-0" strokeWidth={2.5} />
      {PAYMENT_STATUS[status].label}
    </span>
  );
}
