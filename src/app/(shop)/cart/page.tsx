import { getCart } from "@/lib/queries/cart.query";

import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { ClearCartButton } from "@/components/cart/clear-cart-button";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Сагс" };

/**
 * САГСНЫ ХУУДАС.
 *
 * Server Component — өгөгдөл, тооцоолол бүгд серверт.
 * Зөвхөн тоо өөрчлөх, хасах товчнууд нь Client Component.
 */
export default async function CartPage() {
  const cart = await getCart();

  // cart null эсвэл хоосон — хоёуланд нь ижил дэлгэц
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-shop py-12 lg:py-16">
        <Heading count={0} />
        <EmptyState
          title="Сагс хоосон байна"
          description="Танд таалагдах бараа хүлээж байна. Дэлгүүрээ нэг эргээд үзээрэй."
          actionLabel="Дэлгүүр рүү очих"
          actionHref="/shop"
        />
      </div>
    );
  }

  const items = cart.items;

  // Захиалж болохгүй мөр байгаа эсэх
  const blocked = items.some(
    (item) =>
      !item.variant.product.isActive ||
      item.variant.stock === 0 ||
      item.exceedsStock,
  );

  return (
    <div className="container-shop py-12 lg:py-16">
      <Heading count={cart.totals.itemCount} />

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        {/* Барааны жагсаалт */}
        <div className="min-w-0">
          <ul className="border-t border-line">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>

          <div className="mt-6 flex justify-end">
            <ClearCartButton />
          </div>
        </div>

        {/* Хураангуй — гүйлгэхэд наалдаж үлдэнэ */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
          <CartSummary
            totals={cart.totals}
            coupon={cart.coupon}
            blocked={blocked}
          />
        </aside>
      </div>
    </div>
  );
}

/** Хуудасны гарчиг */
function Heading({ count }: { count: number }) {
  return (
    <>
      <p className="label text-graphite">Таны сонголт</p>
      <h1 className="mt-3 mb-10 font-display text-3xl font-medium uppercase tracking-label">
        Сагс
        {count > 0 && (
          <span className="ml-3 text-base text-graphite">({count})</span>
        )}
      </h1>
    </>
  );
}
