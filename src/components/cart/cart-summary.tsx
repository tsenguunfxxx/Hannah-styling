import Link from "next/link";
import { Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { CartTotals } from "@/lib/cart-utils";
import {
  CouponForm,
  type AppliedCoupon,
} from "@/components/cart/coupon-form";

/**
 * Захиалгын хураангуй.
 * Зөвхөн харуулна — тооцооллыг lib/cart-utils.ts хийсэн.
 */
export function CartSummary({
  totals,
  coupon,
  blocked = false,
}: {
  totals: CartTotals;
  coupon: AppliedCoupon;
  /** Үлдэгдэл хүрэлцэхгүй мөр байвал үргэлжлүүлэхийг зогсооно */
  blocked?: boolean;
}) {
  const isFreeShipping = totals.shippingFee === 0;

  // Үнэгүй хүргэлт хүртэл хэдэн хувь явсныг харуулна
  const progress = Math.min(
    100,
    Math.round(
      ((FREE_SHIPPING_THRESHOLD - totals.untilFreeShipping) /
        FREE_SHIPPING_THRESHOLD) *
        100,
    ),
  );

  return (
    <div className="border border-line p-6">
      <h2 className="label border-b border-line pb-4">Захиалгын хураангуй</h2>

      <dl className="mt-5 space-y-3 text-sm">
        <Row label={`Бараа (${totals.itemCount} ширхэг)`}>
          {formatPrice(totals.subtotal)}
        </Row>

        {totals.discount > 0 && (
          <Row label={`Хямдрал${coupon ? ` (${coupon.code})` : ""}`}>
            <span className="text-sale">−{formatPrice(totals.discount)}</span>
          </Row>
        )}

        <Row label="Хүргэлт">
          {isFreeShipping ? (
            <span className="text-ink">Үнэгүй</span>
          ) : (
            formatPrice(totals.shippingFee)
          )}
        </Row>
      </dl>

      {/* Купон */}
      <div className="mt-5 border-t border-line pt-5">
        <CouponForm applied={coupon} />
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-ink pt-4">
        <span className="label">Нийт</span>
        <span className="font-display text-xl tabular-nums">
          {formatPrice(totals.total)}
        </span>
      </div>

      {/* Үнэгүй хүргэлтийн явц */}
      <div className="mt-6 bg-sand p-4">
        <p className="flex items-start gap-2 text-xs leading-relaxed">
          <Truck className="mt-0.5 size-3.5 shrink-0" />
          {totals.untilFreeShipping > 0 ? (
            <span>
              Дахин <strong>{formatPrice(totals.untilFreeShipping)}</strong>-ийн
              бараа нэмбэл хүргэлт үнэгүй.
            </span>
          ) : (
            <span>Танай захиалгын хүргэлт үнэгүй.</span>
          )}
        </p>

        <div
          className="mt-3 h-0.5 w-full bg-line"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Үнэгүй хүргэлт хүртэлх явц"
        >
          <div className="h-full bg-ink" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {blocked ? (
        <>
          <Button disabled className="label mt-6 h-13 w-full">
            Захиалга үргэлжлүүлэх
          </Button>
          <p className="mt-3 text-center text-xs text-sale">
            Үлдэгдэл хүрэлцэхгүй мөрийг эхлээд засна уу.
          </p>
        </>
      ) : (
        <Button
          className="label mt-6 h-13 w-full"
          nativeButton={false}
          render={<Link href="/checkout" />}
        >
          Захиалга үргэлжлүүлэх
        </Button>
      )}

      <Link
        href="/shop"
        className="label mt-4 block text-center text-graphite underline underline-offset-4 transition-colors hover:text-ink"
      >
        Дэлгүүрээ үргэлжлүүлэх
      </Link>
    </div>
  );
}

/** Хураангуйн нэг мөр */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-graphite">{label}</dt>
      <dd className="tabular-nums">{children}</dd>
    </div>
  );
}
