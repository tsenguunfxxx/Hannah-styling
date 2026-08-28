"use client";

import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Алдааны нэгдсэн харагдац.
 *
 * error.tsx файлууд бүгд үүнийг ашиглана — алдааны дэлгэц
 * хаана ч ижил харагдана.
 *
 * ЧУХАЛ: алдааны бодит текстийг хэрэглэгчид ХАРУУЛАХГҮЙ.
 * Тэнд database-ийн бүтэц, файлын зам зэрэг мэдээлэл орсон байж
 * болно. Зөвхөн `digest` кодыг харуулна — хэрэглэгч түүнийг
 * бидэнд хэлбэл бид серверийн логоос яг тэр алдааг олно.
 */
export function ErrorState({
  title = "Алдаа гарлаа",
  description = "Түр зуурын алдаа гарлаа. Дахин оролдоно уу.",
  digest,
  reset,
  homeHref = "/",
  homeLabel = "Нүүр хуудас",
}: {
  title?: string;
  description?: string;
  digest?: string;
  reset?: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <TriangleAlert className="size-8 text-graphite" strokeWidth={1.2} />

      <h1 className="mt-6 font-display text-2xl uppercase tracking-label">
        {title}
      </h1>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-graphite">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button onClick={reset} className="label h-11">
            <RotateCw className="size-3.5" />
            Дахин оролдох
          </Button>
        )}

        <Button
          variant="outline"
          className="label h-11"
          nativeButton={false}
          render={<Link href={homeHref} />}
        >
          {homeLabel}
        </Button>
      </div>

      {digest && (
        <p className="label mt-8 text-graphite">Алдааны код: {digest}</p>
      )}
    </div>
  );
}
