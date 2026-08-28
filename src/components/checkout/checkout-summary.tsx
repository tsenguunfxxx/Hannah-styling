import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import type { CartLineItem } from "@/lib/queries/cart.query";
import type { CartTotals } from "@/lib/cart-utils";
import {
  CouponForm,
  type AppliedCoupon,
} from "@/components/cart/coupon-form";

/**
 * Захиалахын өмнөх хураангуй.
 * Хэрэглэгч ЮУГ, ХЭДЭН ширхэг, ХЭДЭН төгрөгөөр авч байгаагаа
 * баталгаажуулахаас ӨМНӨ бүрэн харна.
 */
export function CheckoutSummary({
  items,
  totals,
  coupon,
}: {
  items: CartLineItem[];
  totals: CartTotals;
  coupon: AppliedCoupon;
}) {
  return (
    <div className="border border-line p-6">
      <h2 className="label border-b border-line pb-4">
        Захиалга ({totals.itemCount} ширхэг)
      </h2>

      <ul className="divide-y divide-line">
        {items.map((item) => {
          const image = item.variant.product.images[0];

          return (
            <li key={item.id} className="flex gap-3 py-4">
              <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden bg-sand">
                {image && (
                  <Image
                    src={image.url}
                    alt={image.alt ?? item.variant.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}

                {/* Тоог зургийн буланд */}
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-ink text-[10px] text-bone tabular-nums">
                  {item.quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.variant.product.name}</p>
                <p className="mt-0.5 text-xs text-graphite">
                  {item.variant.color} · {item.variant.size}
                </p>
              </div>

              <p className="text-sm tabular-nums">
                {formatPrice(item.lineTotal)}
              </p>
            </li>
          );
        })}
      </ul>

      <dl className="space-y-3 border-t border-line pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-graphite">Бараа</dt>
          <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-graphite">
              Хямдрал{coupon ? ` (${coupon.code})` : ""}
            </dt>
            <dd className="text-sale tabular-nums">
              −{formatPrice(totals.discount)}
            </dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-graphite">Хүргэлт</dt>
          <dd className="tabular-nums">
            {totals.shippingFee === 0 ? "Үнэгүй" : formatPrice(totals.shippingFee)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-line pt-5">
        <CouponForm applied={coupon} />
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-ink pt-4">
        <span className="label">Нийт</span>
        <span className="font-display text-xl tabular-nums">
          {formatPrice(totals.total)}
        </span>
      </div>

      <Link
        href="/cart"
        className="label mt-6 block text-center text-graphite underline underline-offset-4 transition-colors hover:text-ink"
      >
        Сагсаа засах
      </Link>
    </div>
  );
}
