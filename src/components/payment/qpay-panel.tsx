"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  checkPaymentStatusAction,
  startQpayPaymentAction,
  type QpayInvoiceResult,
} from "@/actions/payment.action";

/** Хэдэн секунд тутам автоматаар шалгах вэ */
const POLL_INTERVAL_MS = 5000;

/** Хэдэн удаа шалгаад зогсох вэ (5 сек × 60 = 5 минут) */
const MAX_POLLS = 60;

/**
 * QPay-ээр төлөх самбар.
 *
 * QR код гарч ирээд, хэрэглэгч утсаараа уншуулна. Төлбөр орсныг
 * QPay callback-аар мэдэгддэг ч сүлжээ тасарч мэдэх тул бид
 * 5 секунд тутам ӨӨРСДӨӨ ч шалгана.
 */
export function QpayPanel({
  orderNumber,
  amount,
}: {
  orderNumber: string;
  amount: number;
}) {
  const router = useRouter();
  const [isStarting, startInvoice] = useTransition();
  const [isChecking, startCheck] = useTransition();

  const [invoice, setInvoice] = useState<QpayInvoiceResult | null>(null);
  const [paid, setPaid] = useState(false);
  const [polls, setPolls] = useState(0);

  function createInvoice() {
    startInvoice(async () => {
      const result = await startQpayPaymentAction(orderNumber);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setInvoice(result.data);
      setPolls(0);
    });
  }

  function checkNow(silent = false) {
    startCheck(async () => {
      const result = await checkPaymentStatusAction(orderNumber);

      if (!result.success) {
        if (!silent) toast.error(result.error);
        return;
      }

      if (result.data.paid) {
        setPaid(true);
        toast.success("Төлбөр амжилттай хийгдлээ.");
        router.refresh();
        return;
      }

      if (!silent) toast.info("Төлбөр хараахан ороогүй байна.");
    });
  }

  /*
    Нэхэмжлэх үүссэний дараа автоматаар шалгаж эхэлнэ.
    Төлөгдмөгц, эсвэл 5 минутын дараа зогсоно — эцэс төгсгөлгүй
    хүсэлт явуулах нь сервер, батарей хоёуланд нь дэмий ачаалал.
  */
  useEffect(() => {
    if (!invoice || paid || polls >= MAX_POLLS) return;

    const timer = setTimeout(() => {
      setPolls((count) => count + 1);
      checkNow(true);
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, paid, polls]);

  if (paid) {
    return (
      <div className="flex items-start gap-3 border border-ink p-5">
        <CircleCheck className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-display text-lg uppercase tracking-label">
            Төлбөр хүлээн авлаа
          </p>
          <p className="mt-1 text-sm text-graphite">
            Бид захиалгыг тань бэлтгэж эхэлнэ.
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="border border-line p-6 text-center">
        <QrCode className="mx-auto size-8 text-graphite" strokeWidth={1.2} />
        <p className="mt-4 text-sm text-graphite">
          QR код үүсгээд утсаараа уншуулна уу.
        </p>

        <Button
          onClick={createInvoice}
          disabled={isStarting}
          className="label mt-6 h-12 w-full"
        >
          {isStarting && <Loader2 className="size-4 animate-spin" />}
          {formatPrice(amount)} — QR код үүсгэх
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-line p-6 text-center">
        {/*
          QPay-ийн буцаасан QR-ийг харуулна.
          base64 өгөгдөл тул next/image-ээр дамжуулах шаардлагагүй.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${invoice.qrImage}`}
          alt="QPay QR код"
          className="mx-auto size-56 bg-white p-2"
        />

        <p className="mt-4 font-display text-xl tabular-nums">
          {formatPrice(amount)}
        </p>

        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-graphite">
          {isChecking ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Шалгаж байна...
            </>
          ) : polls >= MAX_POLLS ? (
            "Автомат шалгалт зогссон. Доорх товчийг дарна уу."
          ) : (
            "Төлбөр орох хүртэл автоматаар шалгана."
          )}
        </p>

        <Button
          variant="outline"
          onClick={() => checkNow(false)}
          disabled={isChecking}
          className="label mt-5 h-11 w-full"
        >
          <RefreshCw className="size-3.5" />
          Төлбөрөө шалгах
        </Button>
      </div>

      {/* Утсан дээрх банкны аппликейшнууд */}
      {invoice.bankUrls.length > 0 && (
        <div>
          <p className="label text-graphite">Банкны аппликейшнаар төлөх</p>

          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {invoice.bankUrls.map((bank) => (
              <li key={bank.name}>
                <a
                  href={bank.link}
                  className="flex items-center gap-2 border border-line px-3 py-2.5 text-xs transition-colors hover:border-ink"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bank.logo} alt="" className="size-5 shrink-0" />
                  <span className="truncate">{bank.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
