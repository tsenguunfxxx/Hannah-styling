"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";
import { updateOrderStatusAction } from "@/actions/admin/order.action";

/**
 * Захиалгын төлөв солих товчнууд.
 *
 * Зөвхөн ЗӨВШӨӨРӨГДСӨН дараагийн төлвүүд харагдана (constants.ts).
 * Ингэснээр админ санамсаргүй "Хүлээгдэж байна → Хүргэгдсэн" гэж
 * үсрэх боломжгүй.
 */
export function OrderStatusActions({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: OrderStatusKey;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Цуцлах нь буцаах боломжгүй тул баталгаажуулна
  const [confirmCancel, setConfirmCancel] = useState(false);

  const nextStatuses = ORDER_STATUS[status].next as readonly OrderStatusKey[];

  function changeTo(next: OrderStatusKey) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderNumber, next);
      setConfirmCancel(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Төлөв "${ORDER_STATUS[next].label}" боллоо.`);
      router.refresh();
    });
  }

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-graphite">
        Энэ захиалга эцсийн төлөвт хүрсэн. Өөрчлөх боломжгүй.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((next) => {
          const isCancel = next === "CANCELLED";

          return (
            <Button
              key={next}
              variant={isCancel ? "outline" : "default"}
              disabled={isPending}
              onClick={() =>
                isCancel ? setConfirmCancel(true) : changeTo(next)
              }
              className={
                isCancel
                  ? "label h-11 border-line text-graphite hover:border-sale hover:text-sale"
                  : "label h-11"
              }
            >
              {isPending && !isCancel && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              {ORDER_STATUS[next].label}
              {!isCancel && <ArrowRight className="size-3.5" />}
            </Button>
          );
        })}
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Захиалгыг цуцлах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              {orderNumber} цуцлагдаж, захиалсан бараа агуулахад буцаж
              нэмэгдэнэ. Энэ үйлдлийг буцаах боломжгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction onClick={() => changeTo("CANCELLED")}>
              Тийм, цуцлах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
