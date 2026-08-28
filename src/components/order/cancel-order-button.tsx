"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelOrderAction } from "@/actions/order.action";

/**
 * Захиалга цуцлах товч.
 * Буцаах боломжгүй тул баталгаажуулах цонх заавал гарна.
 */
export function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Base UI-ийн AlertDialogAction цонхыг өөрөө хаадаггүй
  const [open, setOpen] = useState(false);

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelOrderAction(orderNumber);

      setOpen(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Захиалга цуцлагдлаа. Үлдэгдэл буцаагдсан.");
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            disabled={isPending}
            className="label inline-flex items-center gap-2 text-graphite underline underline-offset-4 transition-colors hover:text-sale disabled:opacity-40"
          />
        }
      >
        {isPending && <Loader2 className="size-3 animate-spin" />}
        Захиалга цуцлах
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Захиалга цуцлах уу?</AlertDialogTitle>
          <AlertDialogDescription>
            {orderNumber} дугаартай захиалга цуцлагдана. Захиалсан бараа
            агуулахад буцаж нэмэгдэнэ. Энэ үйлдлийг буцаах боломжгүй.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Болих</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>
            Тийм, цуцлах
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
