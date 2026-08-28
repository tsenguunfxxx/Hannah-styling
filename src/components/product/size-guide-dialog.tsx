"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SizeGuide } from "@/components/product/size-guide";

/**
 * "Размерын заавар" холбоос — дарахад цонх нээгдэнэ.
 *
 * Яагаад цонх вэ? Хэрэглэгч размераа сонгож байхдаа хуудсаа алдалгүй
 * хүснэгтээ хараад буцаж сонголтоо үргэлжлүүлэх боломжтой.
 */
export function SizeGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button type="button" className="label underline underline-offset-4" />
        }
      >
        Размерын заавар
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-label">
            Размерын заавар
          </DialogTitle>
          <DialogDescription>
            Хэмжээ нь сантиметрээр өгөгдсөн.
          </DialogDescription>
        </DialogHeader>

        <SizeGuide />
      </DialogContent>
    </Dialog>
  );
}
