import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
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

        <Row label="Хүргэлт">{formatPrice(totals.shippingFee)}</Row>
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
