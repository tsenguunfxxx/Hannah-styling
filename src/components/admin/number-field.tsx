"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Тоон талбар — ГАРААР бичихэд саадгүй.
 *
 * ЯМАР АСУУДЛЫГ ШИЙДЭЖ БАЙНА ВЭ?
 *
 * Энгийн `value={stock}` талбар дээр 0-ийг устгах гэхэд дараах
 * зүйл болдог: хайрцаг хоромхон зуур хоосорно → `Number("")` нь
 * 0 буцаана → React дахин 0 бичнэ. Өөрөөр хэлбэл 0 хэзээ ч
 * арилдаггүй, бичсэн тоо нь түүний ард наалддаг (0 → 05).
 * Гарах цорын ганц зам нь дээш/доош сумыг дарах байв.
 *
 * ШИЙДЭЛ:
 *   Бичиж байх ҮЕД гарнаас орж ирсэн ТЕКСТИЙГ хэвээр нь харуулна
 *   (`draft`). Тиймээс хайрцаг хоосон байж чадна. Гаднаа гарахад
 *   (blur) draft-аа хаяж, эцэг бүрэлдэхүүний жинхэнэ тоог эргүүлж
 *   харуулна — ингэхэд "05" нь "5" болж цэгцэрнэ.
 *
 * Хоосон хайрцаг ямар утга илгээх нь `nullable`-ээс хамаарна:
 *   false (анхдагч) → 0    (үлдэгдэл, эрэмбэ мэт)
 *   true            → null (сонголтот үнэ, хязгаар мэт)
 *
 * Фокус авахад бичсэн зүйлийг БҮХЭЛД НЬ сонгоно — дарангуутаа
 * шинэ тоо бичихэд хуучин нь солигдоно.
 */
export function NumberField({
  value,
  onChange,
  onBlur,
  nullable = false,
  min = 0,
  placeholder,
  className,
  name,
  "aria-label": ariaLabel,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  nullable?: boolean;
  min?: number;
  placeholder?: string;
  className?: string;
  name?: string;
  "aria-label"?: string;
}) {
  // null = бичиж байгаагүй, эцгийн утгыг харуул
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={min}
      name={name}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={cn("tabular-nums", className)}
      value={draft ?? (value ?? "")}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);

        if (raw === "") {
          onChange(nullable ? null : 0);
          return;
        }

        const parsed = Number(raw);

        // "12e5", "--3" мэт утгыг Number нь NaN болгоно — хэрэггүй
        if (Number.isNaN(parsed)) return;

        onChange(parsed);
      }}
      onBlur={() => {
        setDraft(null);
        onBlur?.();
      }}
    />
  );
}
