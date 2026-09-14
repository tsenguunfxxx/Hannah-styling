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

      {/*
        `max-h-[85dvh] overflow-y-auto` — намхан дэлгэц дээр цонх
        хэтэрч, доод хэсэг нь хүрэхгүй үлдэхээс сэргийлнэ. `dvh` нь
        гар утасны хөтчийн хаяг бичих мөр нуугдаж гарахад өөрчлөгддөг
        ЖИНХЭНЭ өндрийг барина — `vh` бол тогтмол тул тэнд алдаа өгдөг.

        `sm:max-w-lg` — өмнө нь `2xl` (672px) байсан нь хоёрхон
        баганад хэт өргөн, утга хоёр зах руугаа хөөгдөж уншихад
        хэцүү болгодог байв.
      */}
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
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
