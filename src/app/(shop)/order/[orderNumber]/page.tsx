import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, CreditCard } from "lucide-react";

import { getOrderByNumber } from "@/lib/queries/order.query";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS, type PaymentStatusKey } from "@/lib/constants";

import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { PaymentStatusBadge } from "@/components/order/payment-status-badge";
import { OrderTimeline } from "@/components/order/order-timeline";
import { CancelOrderButton } from "@/components/order/cancel-order-button";

/** Хэрэглэгч өөрөө цуцалж болох төлвүүд */
const CANCELLABLE = ["PENDING", "CONFIRMED"];

export async function generateMetadata({
  params,
}: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  return { title: `Захиалга ${orderNumber}` };
}

/**
 * ЗАХИАЛГЫН ДЭЛГЭРЭНГҮЙ.
 *
 * Захиалга үүсмэгц энэ хуудас руу шилжинэ (?new=1).
 * Дараа нь "Миний захиалга"-аас дахин орж үзнэ.
 *
 * АЮУЛГҮЙ БАЙДАЛ: getOrderByNumber нь өөрийнх биш захиалгад null
 * буцаадаг тул өөр хүний дугаар таамаглаад орох боломжгүй.
 */
export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  const { new: isNew } = await searchParams;

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.value === order.payment?.method)?.label ??
    "—";

  /*
    Одоо төлөх шаардлагатай эсэх.
    Хүргэлтээр төлөх (COD) бол одоо төлөх зүйл алга — бараагаа
    хүлээж авахдаа төлнө. Цуцлагдсан захиалгад ч төлбөр хэрэггүй.
  */
  const needsPayment =
    order.payment?.status === "PENDING" &&
    order.payment.method !== "COD" &&
    order.status !== "CANCELLED";

  /*
    Төлбөр амжилттай орсон уу.
    wire.mn төлбөр дуусмагц энэ хуудас руу буцаан авчирдаг — тэр
    мөчид баяр хүргэсэн мэдэгдэл харуулах нь хамгийн зөв.
  */
  const isPaid = order.payment?.status === "PAID";
  const paymentFailed = order.payment?.status === "FAILED";

  return (
    <div className="container-shop py-12 lg:py-16">
      {/* Төлбөр амжилттай — хамгийн эхэнд, хамгийн тод */}
      {isPaid && order.status !== "CANCELLED" && (
        <div className="mb-10 border border-ink bg-ink p-6 text-bone sm:p-8">
          <div className="flex items-start gap-4">
            <CircleCheck className="mt-1 size-6 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-display text-xl uppercase tracking-label sm:text-2xl">
                Баярлалаа!
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-bone/75">
                Төлбөр амжилттай хүлээн авлаа. Захиалгыг тань бэлтгэж
                эхэллээ — бэлэн болмогц бид тантай холбогдоно.
              </p>
              <p className="label mt-4 text-bone/50">
                {order.orderNumber} · {formatPrice(order.total)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Төлбөр амжилтгүй болсон */}
      {paymentFailed && order.status !== "CANCELLED" && (
        <div className="mb-10 flex items-start gap-3 border border-sale p-5 text-sale">
          <CircleCheck className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-display text-lg uppercase tracking-label">
              Төлбөр амжилтгүй боллоо
            </p>
            <p className="mt-1 text-sm">
              Мөнгө таны данснаас хасагдаагүй. Дахин оролдох эсвэл өөр
              аргаар төлж болно.
            </p>
          </div>
        </div>
      )}

      {/* Шинэ захиалга — зөвхөн ХАРААХАН төлөөгүй үед */}
      {isNew && !isPaid && !paymentFailed && (
        <div className="mb-10 flex items-start gap-3 border border-ink p-5">
          <CircleCheck className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-display text-lg uppercase tracking-label">
              Захиалга хүлээн авлаа
            </p>
            <p className="mt-1 text-sm text-graphite">
              {needsPayment
                ? "Төлбөрөө төлснөөр захиалга бэлтгэгдэж эхэлнэ."
                : "Бид тантай удахгүй холбогдож захиалгыг баталгаажуулна."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label text-graphite">Захиалгын дугаар</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-label">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-graphite">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-10 border border-line p-5">
        <OrderTimeline status={order.status} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        {/* Захиалсан бараа */}
        <div className="min-w-0">
          <h2 className="label border-b border-line pb-3">Захиалсан бараа</h2>

          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <Link
                  href={`/product/${item.productSlug}`}
                  className="relative aspect-3/4 w-16 shrink-0 overflow-hidden bg-sand"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="text-sm hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-xs text-graphite">
                    {item.color} · {item.size} · {item.quantity} ширхэг
                  </p>
                </div>

                <p className="text-sm tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Мэдээлэл */}
        <aside className="space-y-8">
          <InfoBlock title="Хүргэлтийн хаяг">
            <p>{order.customerName}</p>
            <p>{order.phone}</p>
            {order.email && <p>{order.email}</p>}
            <p className="mt-2">
              {order.city}, {order.district} дүүрэг
            </p>
            <p>{order.addressLine}</p>
            {order.note && (
              <p className="mt-2 text-graphite">Тэмдэглэл: {order.note}</p>
            )}
          </InfoBlock>

          <InfoBlock title="Төлбөр">
            <p>{paymentLabel}</p>

            {order.payment && (
              <div className="mt-2">
                <PaymentStatusBadge
                  status={order.payment.status as PaymentStatusKey}
                />
              </div>
            )}

            {order.payment?.transactionId && (
              <p className="text-graphite">
                Гүйлгээ: {order.payment.transactionId}
              </p>
            )}

            {/*
              Хоёр гол үйлдэл ЗЭРЭГЦЭЭ байрлана — "төлөх" эсвэл
              "цуцлах". Өмнө нь цуцлах нь барааны жагсаалтын доор,
              өөр газар байсан тул хайх шаардлагатай байв.
            */}
            {needsPayment && (
              <Button
                className="label mt-4 h-11 w-full"
                nativeButton={false}
                render={<Link href={`/order/${order.orderNumber}/pay`} />}
              >
                <CreditCard className="size-4" />
                Төлбөр төлөх
              </Button>
            )}

            {CANCELLABLE.includes(order.status) && (
              <CancelOrderButton orderNumber={order.orderNumber} />
            )}
          </InfoBlock>

          <div className="border border-line p-5">
            <dl className="space-y-3 text-sm">
              <SummaryRow label="Бараа">
                {formatPrice(order.subtotal)}
              </SummaryRow>
              <SummaryRow label="Хүргэлт">
                {order.shippingFee === 0
                  ? "Үнэгүй"
                  : formatPrice(order.shippingFee)}
              </SummaryRow>
              {order.discount > 0 && (
                <SummaryRow label={`Хямдрал${order.coupon ? ` (${order.coupon.code})` : ""}`}>
                  −{formatPrice(order.discount)}
                </SummaryRow>
              )}
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
              <span className="label">Нийт</span>
              <span className="font-display text-lg tabular-nums">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          <Link
            href="/account/orders"
            className="label block text-center text-graphite underline underline-offset-4 transition-colors hover:text-ink"
          >
            Бүх захиалгаа харах
          </Link>
        </aside>
      </div>
    </div>
  );
}

function InfoBlock({
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

function SummaryRow({
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

/** 2026 оны 8 сарын 26, 14:32 */
