import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getAdminOrderByNumber } from "@/lib/queries/admin/order.query";
import { formatDateTime, formatDeliveryArea, formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS, type PaymentStatusKey } from "@/lib/constants";

import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { OrderTimeline } from "@/components/order/order-timeline";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { PaymentStatusSelect } from "@/components/admin/payment-status-select";
import { PaymentStatusBadge } from "@/components/order/payment-status-badge";

export async function generateMetadata({
  params,
}: PageProps<"/admin/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  return { title: `Захиалга ${orderNumber}` };
}

/**
 * АДМИН — ЗАХИАЛГЫН ДЭЛГЭРЭНГҮЙ.
 * Төлөв солих, төлбөр тэмдэглэх энд хийгдэнэ.
 */
export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[orderNumber]">) {
  const { orderNumber } = await params;

  const order = await getAdminOrderByNumber(orderNumber);
  if (!order) notFound();

  const paymentMethod =
    PAYMENT_METHODS.find((m) => m.value === order.payment?.method)?.label ?? "—";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="label inline-flex items-center gap-2 text-graphite transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Захиалга руу буцах
        </Link>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-label tabular-nums">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-graphite">
              {formatDateTime(order.createdAt)}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Явц */}
      <div className="border border-line p-5">
        <OrderTimeline status={order.status} />
      </div>

      {/* Төлөв солих */}
      <section className="border border-ink p-5">
        <h2 className="label text-graphite">Дараагийн алхам</h2>
        <div className="mt-4">
          <OrderStatusActions
            orderNumber={order.orderNumber}
            status={order.status}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Бараа */}
        <div className="min-w-0">
          <h2 className="label border-b border-line pb-3">Захиалсан бараа</h2>

          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <Link
                  href={`/product/${item.productSlug}`}
                  target="_blank"
                  className="relative aspect-3/4 w-14 shrink-0 overflow-hidden bg-sand"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="text-sm">{item.productName}</p>
                  <p className="mt-1 text-xs text-graphite">
                    {item.color} · {item.size} · {item.quantity} ширхэг
                  </p>
                  {/* Бараа устсан бол холбоос тасарсан гэдгийг мэдэгдэнэ */}
                  {!item.variantId && (
                    <p className="mt-1 text-xs text-sale">
                      Энэ бараа агуулахаас устсан
                    </p>
                  )}
                </div>

                <p className="text-sm tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <Row label="Бараа">{formatPrice(order.subtotal)}</Row>
            <Row label="Хүргэлт">
              {order.shippingFee === 0 ? "Үнэгүй" : formatPrice(order.shippingFee)}
            </Row>
            {order.discount > 0 && (
              <Row label={`Хямдрал${order.coupon ? ` (${order.coupon.code})` : ""}`}>
                −{formatPrice(order.discount)}
              </Row>
            )}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
            <span className="label">Нийт</span>
            <span className="font-display text-xl tabular-nums">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Хажуугийн мэдээлэл */}
        <aside className="space-y-8">
          {/*
            Хүргэлтийн мэдээллийг ТОМООР, тодоор. Хүргэгч энэ хэсгийг
            уншиж ажилладаг тул бусад тайлбар шиг бүдэг байх ёсгүй.
            Утас, хаяг хоёрыг хуулж авахад амар байхаар тусад нь мөр
            болгосон.
          */}
          <Block title="Хүргэлтийн мэдээлэл">
            <dl className="space-y-3">
              <Field label="Хүлээн авагч">{order.customerName}</Field>

              <Field label="Утас">
                <a
                  href={`tel:${order.phone}`}
                  className="tabular-nums underline underline-offset-4"
                >
                  {order.phone}
                </a>
              </Field>

              <Field label="Хаяг">
                <span className="block">
                  {formatDeliveryArea(order.city, order.district)}
                </span>
                <span className="block">{order.addressLine}</span>
              </Field>

              {order.note && (
                <Field label="Тэмдэглэл">
                  <span className="block border-l-2 border-ink pl-3">
                    {order.note}
                  </span>
                </Field>
              )}
            </dl>
          </Block>

          <Block title="Хэрэглэгч">
            {order.user ? (
              <>
                <p>{order.user.name ?? "—"}</p>
                <p className="text-graphite">{order.user.email}</p>
              </>
            ) : (
              <p className="text-graphite">Бүртгэлгүй (зочин)</p>
            )}
          </Block>

          <div>
            <h2 className="label border-b border-line pb-3">Төлбөр</h2>

            <div className="mt-4 space-y-3 text-sm">
              {/* Одоогийн төлөв — хамгийн эхэнд, өнгөөр нь ялгаатай */}
              {order.payment && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-graphite">Төлбөр</span>
                  <PaymentStatusBadge
                    status={order.payment.status as PaymentStatusKey}
                  />
                </div>
              )}

              <div className="flex justify-between gap-3">
                <span className="text-graphite">Арга</span>
                <span>{paymentMethod}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-graphite">Дүн</span>
                <span className="tabular-nums">
                  {formatPrice(order.payment?.amount ?? order.total)}
                </span>
              </div>

              {order.payment?.paidAt && (
                <div className="flex justify-between gap-3">
                  <span className="text-graphite">Төлсөн</span>
                  <span className="tabular-nums">
                    {formatDateTime(order.payment.paidAt)}
                  </span>
                </div>
              )}

              {/* Банкны шилжүүлгийг баталгаажуулахад хэрэгтэй */}
              {order.payment?.transactionId && (
                <div className="flex justify-between gap-3">
                  <span className="text-graphite">Гүйлгээ</span>
                  <span className="tabular-nums">
                    {order.payment.transactionId}
                  </span>
                </div>
              )}

              {order.payment && (
                <div className="pt-2">
                  <p className="label mb-2 text-graphite">Төлөв солих</p>
                  <PaymentStatusSelect
                    orderNumber={order.orderNumber}
                    status={order.payment.status as PaymentStatusKey}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Үлдэгдэл буцаагдсан эсэх */}
          {order.status === "CANCELLED" && (
            <p className="border border-line p-4 text-xs text-graphite">
              {order.stockRestored
                ? "Захиалсан барааны үлдэгдэл агуулахад буцаагдсан."
                : "Анхаар: үлдэгдэл буцаагдаагүй байна."}
            </p>
          )}

          <Link
            href={`/order/${order.orderNumber}`}
            target="_blank"
            className="label inline-flex items-center gap-1.5 text-graphite transition-colors hover:text-ink"
          >
            Хэрэглэгчийн харагдац
            <ExternalLink className="size-3" />
          </Link>
        </aside>
      </div>
    </div>
  );
}

/** Хаягийн нэг мөр — шошго бүдэг, утга тод */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="label text-graphite">{label}</dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="label border-b border-line pb-3">{title}</h2>
      <div className="mt-4 space-y-1 text-sm">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-graphite">{label}</dt>
      <dd className="tabular-nums">{children}</dd>
    </div>
  );
}

