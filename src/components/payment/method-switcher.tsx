"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";
import { changePaymentMethodAction } from "@/actions/payment.action";

/**
 * Төлбөрийн аргын сонголт.
 *
 * Төлөх хуудсыг нээмэгц БҮХ арга нэг дор харагдана. Урьд нь
 * checkout дээр сонгосон арга л гарч ирдэг байсан тул бодлоо
 * өөрчилсөн хүн захиалгаа цуцлахаас өөр аргагүй байв.
 */
export function MethodSwitcher({
  orderNumber,
  current,
}: {
  orderNumber: string;
  current: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(method: string) {
    if (method === current || isPending) return;

    startTransition(async () => {
      const result = await changePaymentMethodAction(orderNumber, method);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mb-8">
      <p className="label mb-3 text-graphite">Төлбөрийн арга</p>

      <div className="grid gap-2">
        {PAYMENT_METHODS.map((method) => {
          const active = method.value === current;

          return (
            <button
              key={method.value}
              type="button"
              onClick={() => select(method.value)}
              disabled={isPending}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-3 border p-4 text-left transition-colors",
                active
                  ? "border-ink"
                  : "border-line hover:border-graphite disabled:hover:border-line",
                isPending && "opacity-60",
              )}
            >
              {/* Сонгогдсоныг тэмдэглэх дугуй */}
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border",
                  active ? "border-ink bg-ink text-bone" : "border-line",
                )}
              >
                {active && <Check className="size-3" strokeWidth={2.5} />}
              </span>

              <span className="min-w-0">
                <span className="block text-sm">{method.label}</span>
                <span className="block text-xs text-graphite">
                  {method.hint}
                </span>
              </span>

              {isPending && active && (
                <Loader2 className="ml-auto size-4 shrink-0 animate-spin" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
