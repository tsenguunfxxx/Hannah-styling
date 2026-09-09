"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Дэлгэрэнгүй хуудасны доод хэсгийн табууд.
 *
 * `reviews` нь Server дээр бэлдэгдсэн бэлэн JSX-ээр дамжина.
 * Ингэснээр сэтгэгдлийн өгөгдөл browser руу нэмэлт JavaScript авчрахгүй.
 */
export function ProductTabs({
  details,
  reviews,
  reviewCount,
}: {
  details: string | null;
  reviews: ReactNode;
  reviewCount: number;
}) {
  // Идэвхтэй табын доогуур зурагдах зураас нь табнаас 5px доор гардаг.
  // Тиймээс жагсаалтын доод зайг 5px болгож, зураас нь хүрээн дээр таарна.
  const triggerClass =
    "label h-auto flex-none rounded-none bg-transparent px-0 py-4 text-graphite data-active:bg-transparent data-active:text-ink data-active:shadow-none";

  /*
    "Дэлгэрэнгүй" нь заавал байдаггүй (бараанд бөглөөгүй байж болно).
    Байхгүй үед анхдагчаар сэтгэгдэл рүү шилжинэ — үгүй бол ямар ч
    таб идэвхгүй, агуулга хоосон харагдана.
  */
  return (
    <Tabs defaultValue={details ? "details" : "reviews"}>
      <TabsList
        variant="line"
        /*
          Гурван анхаарах зүйл:

          1. `overflow-x-auto` хассан — табууд хоёрхон тул гүйлгэх
             шаардлагагүй, харин зарим үйлдлийн системд гүйлгэх зурвасыг
             байнга харуулдаг.

          2. `flex-nowrap` — мөр тасарвал байрлал эвдэрнэ.

          3. Өндрийг `group-data-horizontal/tabs:h-auto` гэж бичсэн нь
             ЧУХАЛ. Үндсэн компонент өндрийг яг ийм угтвартайгаар
             (`...:h-8`) тогтоодог тул энгийн `h-auto` хүчингүй болно.
             Өндөр 32px-т үлдвэл идэвхтэй табын доорх зураас хүрээнээс
             доогуур тусдаа мөр болж харагдана.
        */
        className="w-full flex-nowrap justify-start gap-5 rounded-none border-b border-line bg-transparent p-0 pb-[5px] group-data-horizontal/tabs:h-auto sm:gap-8"
      >
        {details && (
          <TabsTrigger value="details" className={triggerClass}>
            Дэлгэрэнгүй
          </TabsTrigger>
        )}

        <TabsTrigger value="reviews" className={triggerClass}>
          Сэтгэгдэл ({reviewCount})
        </TabsTrigger>
      </TabsList>

      {details && (
        <TabsContent value="details" className="pt-8">
          {/*
            Барааны дэлгэрэнгүй нь ХУДАЛДАН АВАХ шийдвэрт хамгийн их
            нөлөөлдөг бичиг — материал, арчилгаа, онцлог. Тиймээс
            жирийн текст биш, гарчиг шиг тод харагдана:

              text-ink       — хамгийн бараан өнгө (#111110)
              font-medium    — үсгийн зузаан нэмэгдсэн
              text-base/lg   — хуудасны бусад текстээс томхон

            Өнгө нь аль хэдийн боломжит хамгийн бараан нь тул
            цаашид тодруулах ганц зам бол хэмжээ, зузаан.
          */}
          <p className="max-w-prose text-base leading-relaxed font-medium whitespace-pre-line text-ink sm:text-lg">
            {details}
          </p>
        </TabsContent>
      )}

      <TabsContent value="reviews" className="pt-8">
        {reviews}
      </TabsContent>
    </Tabs>
  );
}
