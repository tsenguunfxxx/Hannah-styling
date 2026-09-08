import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/queries/cart.query";
import { DISTRICTS } from "@/lib/constants";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import type { CheckoutInput } from "@/schemas/order.schema";

export const metadata: Metadata = { title: "Захиалга баталгаажуулах" };

/**
 * CHECKOUT ХУУДАС.
 *
 * Гурван хамгаалалт:
 *   1. proxy.ts    — нэвтрээгүй бол /login руу
 *   2. requireAuth — энд дахин шалгана (proxy тойрогдвол ч)
 *   3. Server Action — эцсийн шалгалт бичих мөчид
 */
export default async function CheckoutPage() {
  const { user: account } = await requireAuth();
  const cart = await getCart();

  // Хоосон сагстай checkout утгагүй
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // Захиалж болохгүй мөр байвал сагс руу буцаана
  const hasProblem = cart.items.some(
    (item) =>
      !item.variant.product.isActive ||
      item.variant.stock === 0 ||
      item.exceedsStock,
  );

  if (hasProblem) {
    redirect("/cart");
  }

  /*
    Өмнө нь хадгалсан хаяг байвал маягтыг урьдчилж бөглөнө.
    Хэрэглэгчийн нэр, имэйл, утсыг requireAuth аль хэдийн буцаасан.
  */
  const address = await prisma.address.findFirst({
    where: { userId: account.id },
    orderBy: { isDefault: "desc" },
  });

  const defaultValues: Partial<CheckoutInput> = {
    customerName: address?.recipientName ?? account.name ?? "",
    phone: address?.phone ?? account.phone ?? "",
    district: isKnownDistrict(address?.district) ? address.district : "Баянгол",
    addressLine: address?.addressLine ?? "",
  };

  return (
    <div className="container-shop py-12 lg:py-16">
      <p className="label text-graphite">Сүүлийн алхам</p>
      <h1 className="mt-3 mb-10 font-display text-3xl font-medium uppercase tracking-label">
        Захиалга баталгаажуулах
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-16">
        <div className="min-w-0">
          <CheckoutForm
            defaultValues={defaultValues}
            total={cart.totals.total}
          />
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit lg:order-last">
          <CheckoutSummary
            items={cart.items}
            totals={cart.totals}
            coupon={cart.coupon}
          />
        </aside>
      </div>
    </div>
  );
}

/**
 * Хадгалсан дүүрэг жагсаалтад байгаа эсэх.
 * Жагсаалтаас гарсан хуучин утга маягтыг эвдэхээс сэргийлнэ.
 */
function isKnownDistrict(
  value: string | undefined,
): value is (typeof DISTRICTS)[number] {
  return DISTRICTS.includes(value as (typeof DISTRICTS)[number]);
}
