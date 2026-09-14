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
        `sm:max-w-lg` — өмнө нь `2xl` (672px) байсан нь хоёрхон
        баганад хэт өргөн, утга хоёр зах руугаа хөөгдөж уншихад
        хэцүү болгодог байв.
      */}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-label">
            Размерын заавар
          </DialogTitle>
          <DialogDescription>
            Хэмжээ нь сантиметрээр өгөгдсөн.
          </DialogDescription>
        </DialogHeader>

        {/*
          ⚠️ ГҮЙЛГЭХ ХЭСГИЙГ ЗӨВХӨН ХҮСНЭГТ ДЭЭР ТАВИНА.

          Эхлээд `overflow-y-auto`-г цонх дээр нь шууд тавьсан байв.
          Гэтэл хаах (X) товч нь яг ТЭР элемент дотор `absolute` гэж
          сууна. Гүйдэг хайрцаг дотор `absolute` элемент нь агуулгатайгаа
          ХАМТ гүйдэг тул хүснэгтээ доош гүйлгэхэд X товч дээшээ гарч
          алга болдог байлаа — утсан дээр Esc товч байхгүй тул хэрэглэгч
          цонхоо хаах товчгүй үлддэг.

          Одоо зөвхөн доторх хайрцаг гүйнэ. Гарчиг ба X товч хөдөлгөөнгүй
          үлдэнэ.

          `dvh` нь гар утасны хөтчийн хаяг бичих мөр нуугдаж гарахад
          өөрчлөгддөг ЖИНХЭНЭ өндрийг барина — `vh` бол тогтмол тул
          тэнд алддаг. `8rem` нь гарчиг, зай, цонхны дотоод захыг
          нөхөж байна.
        */}
        <div className="max-h-[calc(85dvh-8rem)] overflow-y-auto">
          <SizeGuide />
        </div>
      </DialogContent>
    </Dialog>
  );
}
