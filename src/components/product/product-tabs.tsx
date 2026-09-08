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
          Жижиг дэлгэцэнд табууд нэг мөрөнд багтахгүй тул хажуу тийш
          гүйдэг болгосон. Хуудас бүхэлдээ гүйхээс сэргийлнэ.
        */
        className="h-auto w-full justify-start gap-5 overflow-x-auto rounded-none border-b border-line bg-transparent p-0 pb-[5px] sm:gap-8"
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
          <p className="max-w-prose text-sm leading-relaxed whitespace-pre-line text-graphite">
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
