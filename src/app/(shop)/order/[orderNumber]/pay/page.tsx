import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, Truck } from "lucide-react";

import { getOrderByNumber } from "@/lib/queries/order.query";
import { isQpayConfigured } from "@/lib/qpay";
import { isWireConfigured, isWireTestMode } from "@/lib/wire";
import { formatPrice } from "@/lib/utils";

import { QpayPanel } from "@/components/payment/qpay-panel";
import { WirePanel } from "@/components/payment/wire-panel";
import { BankTransferPanel } from "@/components/payment/bank-transfer-panel";
import { TestPaymentPanel } from "@/components/payment/test-payment-panel";

export async function generateMetadata({
  params,
}: PageProps<"/order/[orderNumber]/pay">) {
  const { orderNumber } = await params;
  return { title: `Төлбөр — ${orderNumber}` };
}

/**
 * ТӨЛБӨРИЙН ХУУДАС.
 *
 * Захиалгын төлбөрийн аргаас хамаарч өөр самбар харуулна.
 * getOrderByNumber нь эзэмшлийг шалгадаг тул өөр хүний захиалгын
 * төлбөрийн хуудсыг нээх боломжгүй.
 */
export default async function PaymentPage({
  params,
}: PageProps<"/order/[orderNumber]/pay">) {
  const { orderNumber } = await params;

  const order = await getOrderByNumber(orderNumber);
  if (!order?.payment) notFound();

  const { payment } = order;

  return (
    <div className="container-shop py-12 lg:py-16">
      <Link
        href={`/order/${order.orderNumber}`}
        className="label inline-flex items-center gap-2 text-graphite transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        Захиалга руу буцах
      </Link>

      <p className="label mt-6 text-graphite">Захиалга {order.orderNumber}</p>
      <h1 className="mt-2 mb-10 font-display text-3xl font-medium uppercase tracking-label">
        Төлбөр төлөх
      </h1>

      <div className="max-w-lg">
        <PaymentBody
          orderNumber={order.orderNumber}
          method={payment.method}
          status={payment.status}
          amount={payment.amount}
          transactionId={payment.transactionId}
          orderCancelled={order.status === "CANCELLED"}
        />
      </div>
    </div>
  );
}

/** Аргаас хамаарч ямар самбар харуулахыг шийднэ */
function PaymentBody({
  orderNumber,
  method,
  status,
  amount,
  transactionId,
  orderCancelled,
}: {
  orderNumber: string;
  method: string;
  status: string;
  amount: number;
  transactionId: string | null;
  orderCancelled: boolean;
}) {
  // Аль хэдийн төлөгдсөн
  if (status === "PAID") {
    return (
      <Notice
        icon={<CircleCheck className="size-5" />}
        title="Төлбөр төлөгдсөн"
        description={`${formatPrice(amount)} хүлээн авсан. Нэмж төлөх шаардлагагүй.`}
        href={`/order/${orderNumber}`}
        linkLabel="Захиалгаа харах"
      />
    );
  }

  if (orderCancelled) {
    return (
      <Notice
        title="Захиалга цуцлагдсан"
        description="Цуцлагдсан захиалгын төлбөр төлөх боломжгүй."
        href="/shop"
        linkLabel="Дэлгүүр рүү очих"
      />
    );
  }

  // Хүргэлтээр төлөх — одоо төлөх зүйл алга
  if (method === "COD") {
    return (
      <Notice
        icon={<Truck className="size-5" />}
        title="Хүргэлтээр төлнө"
        description={`Бараагаа хүлээж авахдаа ${formatPrice(amount)} төлнө. Одоо юу ч хийх шаардлагагүй.`}
        href={`/order/${orderNumber}`}
        linkLabel="Захиалгаа харах"
      />
    );
  }

  // WIRE — түлхүүр тохируулаагүй бол туршилтын самбар
  if (method === "WIRE") {
    return isWireConfigured() ? (
      <WirePanel
        orderNumber={orderNumber}
        amount={amount}
        testMode={isWireTestMode()}
      />
    ) : (
      <TestPaymentPanel orderNumber={orderNumber} />
    );
  }

  if (method === "BANK_TRANSFER") {
    return (
      <BankTransferPanel
        orderNumber={orderNumber}
        amount={amount}
        savedTransactionId={transactionId}
      />
    );
  }

  // QPAY — түлхүүр тохируулаагүй бол туршилтын самбар
  return isQpayConfigured() ? (
    <QpayPanel orderNumber={orderNumber} amount={amount} />
  ) : (
    <TestPaymentPanel orderNumber={orderNumber} />
  );
}

function Notice({
  icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="border border-line p-6">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="font-display text-lg uppercase tracking-label">
            {title}
          </p>
          <p className="mt-2 text-sm text-graphite">{description}</p>
        </div>
      </div>

      <Link
        href={href}
        className="label mt-6 inline-block underline underline-offset-4 transition-colors hover:text-graphite"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
