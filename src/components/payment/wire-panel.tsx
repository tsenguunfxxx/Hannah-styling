"use client";

import { useTransition } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { startWirePaymentAction } from "@/actions/payment.action";

/**
 * wire.mn-ээр төлөх самбар.
 *
 * QR болон банкны сонголтыг бид зурахгүй —
 * wire.mn-ий төлөх хуудас өөрөө бүх операторыг харуулна.
 * Бидний ажил бол зөв холбоос үүсгэж, тийш нь явуулах.
 *
 * Төлбөр төлөгдсөнийг wire.mn webhook-оор мэдэгдэнэ. Хэрэглэгч
 * буцаж ирэхэд захиалгын хуудас шинэчлэгдсэн төлөвөө харуулна.
 */
export function WirePanel({
  orderNumber,
  amount,
  testMode,
}: {
  orderNumber: string;
  amount: number;
  testMode: boolean;
}) {
  const [isPending, startPayment] = useTransition();

  function openCheckout() {
    startPayment(async () => {
      const result = await startWirePaymentAction(orderNumber);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      /*
        Шинэ таб биш, ижил таб-д нээнэ. Төлбөр дуусахад wire.mn
        биднийг буцаан авчирна — шинэ таб бол хэрэглэгч хоёр
        цонхтой үлдэж эргэлзэнэ.
      */
      window.location.href = result.data.url;
    });
  }

  return (
    <div className="space-y-6">
      {testMode && (
        <p className="border border-line bg-card p-4 text-xs leading-relaxed text-graphite">
          Туршилтын горим — бодит мөнгө хөдлөхгүй.
        </p>
      )}

      <dl className="border border-ink p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-graphite">Төлөх дүн</dt>
          <dd className="font-display text-lg tabular-nums">
            {formatPrice(amount)}
          </dd>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <dt className="text-graphite">Захиалга</dt>
          <dd className="font-display tracking-label">{orderNumber}</dd>
        </div>
      </dl>

      <Button
        type="button"
        size="lg"
        className="label w-full"
        disabled={isPending}
        onClick={openCheckout}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ExternalLink className="size-4" />
        )}
        Төлбөр төлөх
      </Button>

      <p className="text-xs leading-relaxed text-graphite">
        Дарахад wire.mn-ий аюулгүй төлөх хуудас нээгдэнэ. Банкны апп,
        цахим хэтэвч, QR-аас өөрт тохирохыг нь сонгоно. Төлж дуусмагц
        энэ хуудас руу буцаж ирнэ.
      </p>
    </div>
  );
}
