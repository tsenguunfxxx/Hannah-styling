"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PAYMENT_STATUS, type PaymentStatusKey } from "@/lib/constants";
import { updatePaymentStatusAction } from "@/actions/admin/order.action";

/**
 * Төлбөрийн төлөв тэмдэглэх.
 *
 * Банкны шилжүүлэг ирсэн эсэхийг админ өөрөө шалгаад тэмдэглэнэ.
 * wire.mn-ээр төлсөн захиалга webhook-оор автоматаар баталгаажна.
 */
export function PaymentStatusSelect({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: PaymentStatusKey;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    startTransition(async () => {
      const result = await updatePaymentStatusAction(orderNumber, next);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Төлбөрийн төлөв шинэчлэгдлээ.");
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <select
        value={status}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Төлбөрийн төлөв"
        className="h-10 w-full appearance-none border border-line bg-transparent px-3 pr-9 text-sm outline-none focus-visible:border-ink disabled:opacity-50"
      >
        {(Object.keys(PAYMENT_STATUS) as PaymentStatusKey[]).map((key) => (
          <option key={key} value={key}>
            {PAYMENT_STATUS[key].label}
          </option>
        ))}
      </select>

      {isPending ? (
        <Loader2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-graphite" />
      ) : (
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-graphite" />
      )}
    </div>
  );
}
