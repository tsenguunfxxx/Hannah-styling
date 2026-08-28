import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Брэндийн лого — эрвээхэй тэмдэг + нэр.
 *
 * SVG-ээр зурсан шалтгаан:
 *   - Ямар ч хэмжээнд хурц, бүдгэрэхгүй
 *   - Сүлжээнээс татах файл байхгүй тул навигаци шуурхай
 *   - `currentColor` ашигласан тул хар дэвсгэр дээр цагаан,
 *     цайван дэвсгэр дээр хар болж ӨӨРӨӨ тохирно
 *
 * Өөрийн логоны файлыг тавихыг хүсвэл доорх <BrandMark />-ийг
 * next/image-ээр сольж болно (public/images/logo.svg гэх мэт).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("size-7", className)}
      fill="none"
    >
      {/*
        Дөрвөн дэлбээ нэг цэгээс тарна.
        Бүгд ижил хэлбэртэй — зөвхөн эргэлт, хэмжээ нь өөр.
      */}
      <g
        transform="translate(50 48)"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinejoin="round"
      >
        {/* Дээд том хос — гадагш, дээш чиглэнэ */}
        <path d="M0 0 A20 30 0 0 1 0 -58 A20 30 0 0 1 0 0Z" transform="rotate(-46)" />
        <path d="M0 0 A20 30 0 0 1 0 -58 A20 30 0 0 1 0 0Z" transform="rotate(46)" />

        {/* Доод жижиг хос — гадагш, доош чиглэнэ */}
        <path d="M0 0 A15 22 0 0 1 0 -44 A15 22 0 0 1 0 0Z" transform="rotate(-138)" />
        <path d="M0 0 A15 22 0 0 1 0 -44 A15 22 0 0 1 0 0Z" transform="rotate(138)" />
      </g>

      {/* Хоёр доод дэлбээний хооронд байрлах жижиг од */}
      <path d="M50 60 L53 68 L50 76 L47 68Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Лого + нэр. Дарвал нүүр хуудас руу.
 * `stacked` — тэмдэг дээр, нэр доор (navbar-ын хэлбэр).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Hannah Styling — нүүр хуудас"
      className={cn(
        "flex flex-col items-center gap-1 transition-opacity hover:opacity-70",
        className,
      )}
    >
      <BrandMark />
      <span className="label whitespace-nowrap text-[10px] tracking-wordmark sm:text-[11px]">
        Hannah Styling
      </span>
    </Link>
  );
}
