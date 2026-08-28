"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { clearCartAction } from "@/actions/cart.action";

/**
 * Сагсыг бүхэлд нь хоослох.
 * Буцаах боломжгүй үйлдэл тул ЗААВАЛ баталгаажуулна.
 */
export function ClearCartButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Base UI-ийн AlertDialogAction нь цонхыг ӨӨРӨӨ хаадаггүй.
  // Тиймээс нээлттэй эсэхийг өөрсдөө удирдана.
  const [open, setOpen] = useState(false);

  function handleClear() {
    startTransition(async () => {
      const result = await clearCartAction();

      setOpen(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Сагс хоосорлоо.");
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
            className="label text-graphite underline underline-offset-4 transition-colors hover:text-sale disabled:opacity-40"
          />
        }
      >
        Сагсыг хоослох
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Сагсыг хоослох уу?</AlertDialogTitle>
          <AlertDialogDescription>
            Сагсанд байгаа бүх бараа устана. Энэ үйлдлийг буцаах боломжгүй.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Болих</AlertDialogCancel>
          <AlertDialogAction onClick={handleClear}>Хоослох</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
