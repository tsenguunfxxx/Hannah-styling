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
            /*
              Төлбөрийн товчтой ИЖИЛ хэлбэр — бүтэн өргөн, ижил
              өндөр. Ялгаа нь зөвхөн хүрээтэй, дүүрэн биш байдал:
              энэ бол хоёрдогч, буцаах боломжгүй үйлдэл.
            */
            className="label mt-3 inline-flex h-11 w-full items-center justify-center gap-2 border border-line text-graphite transition-colors hover:border-sale hover:text-sale disabled:opacity-40"
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
