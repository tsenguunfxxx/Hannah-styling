"use client";

import { useTransition } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { startWirePaymentAction } from "@/actions/payment.action";

/**
 * "Төлбөр төлөх" — НЭГ дарахад шууд төлөх хуудас руу.
 *
 * Өмнө нь энэ товч завсрын хуудас руу аваачдаг байсан бөгөөд тэнд
 * дахин "Төлбөр төлөх" дарах шаардлагатай байв. Хоёр ижил нэртэй
 * товч дараалж гарах нь хэрэглэгчийг эргэлзүүлдэг тул нэгтгэсэн.
 */
export function PayNowButton({ orderNumber }: { orderNumber: string }) {
  const [isPending, startPayment] = useTransition();

  function pay() {
    startPayment(async () => {
      const result = await startWirePaymentAction(orderNumber);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Ижил таб-д нээнэ — төлж дуусаад буцаж ирэхэд хоёр цонх үлдэхгүй
      window.location.href = result.data.url;
    });
  }

  return (
    <Button
      type="button"
      className="label mt-4 h-11 w-full"
      disabled={isPending}
      onClick={pay}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CreditCard className="size-4" />
      )}
      Төлбөр төлөх
    </Button>
  );
}
