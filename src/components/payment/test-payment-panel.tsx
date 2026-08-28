"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { simulatePaymentAction } from "@/actions/payment.action";

/**
 * ТУРШИЛТЫН САМБАР.
 *
 * QPay-ийн мерчант түлхүүр тохируулаагүй үед л харагдана.
 * Server Action нь production-д БҮРЭН унтардаг тул энэ товч
 * бодит дэлгүүр дээр ажиллах боломжгүй.
 */
export function TestPaymentPanel({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSimulate() {
    startTransition(async () => {
      const result = await simulatePaymentAction(orderNumber);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Туршилтын төлбөр амжилттай.");
      router.refresh();
    });
  }

  return (
    <div className="border border-dashed border-line p-5">
      <p className="label flex items-center gap-2 text-graphite">
        <TriangleAlert className="size-3.5" />
        Туршилтын горим
      </p>

      <p className="mt-3 text-sm leading-relaxed text-graphite">
        QPay-ийн мерчант түлхүүр тохируулаагүй байна. Төлбөрийн урсгалыг
        шалгахын тулд доорх товчоор төлбөр орсон гэж дүрсэлж болно.
      </p>

      <Button
        variant="outline"
        onClick={handleSimulate}
        disabled={isPending}
        className="label mt-5 h-11 w-full"
      >
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Төлбөр орсон гэж үзэх
      </Button>

      <p className="mt-3 text-xs text-graphite">
        .env файлд QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE нэмэхэд
        энэ хэсэг алга болж, жинхэнэ QR код гарна.
      </p>
    </div>
  );
}
