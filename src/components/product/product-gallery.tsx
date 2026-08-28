"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

/**
 * Барааны зургийн галерей.
 *
 * Desktop: зүүн талд жижиг зургууд босоо, баруун талд том зураг.
 * Mobile:  том зураг дээр, жижиг зургууд доор хэвтээ.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="label grid aspect-3/4 place-items-center bg-sand text-graphite">
        Зураг байхгүй
      </div>
    );
  }

  // Сүүлчийн зурагнаас дараах нь эхнийх рүү эргэнэ
  const go = (step: number) =>
    setActive((prev) => (prev + step + images.length) % images.length);

  const current = images[active];

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:gap-4">
      {/* Жижиг зургууд */}
      {images.length > 1 && (
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${index + 1}-р зураг`}
              aria-current={index === active}
              className={cn(
                "relative aspect-3/4 w-16 shrink-0 overflow-hidden bg-sand transition-opacity lg:w-full",
                index === active
                  ? "ring-1 ring-ink"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Том зураг */}
      <div className="group relative order-1 aspect-3/4 flex-1 overflow-hidden bg-sand lg:order-2">
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />

            <span className="label absolute bottom-3 left-1/2 -translate-x-1/2 bg-bone/90 px-2 py-1 tabular-nums lg:hidden">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/** Зураг солих сум. Desktop дээр hover хийхэд гарч ирнэ. */
function GalleryArrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Өмнөх зураг" : "Дараагийн зураг"}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-bone/90 transition-opacity hover:bg-bone",
        "lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
