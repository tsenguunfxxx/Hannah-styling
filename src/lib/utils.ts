import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 199000 → "199,000₮" */
export function formatPrice(amount: number): string {
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}

/** Монгол кирилл → латин хөрвүүлэлт */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j",
  з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
  ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f",
  х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya",
};

/**
 * Нэрийг URL-д тохирох slug болгоно.
 * "Хар цамц" → "khar-tsamts"
 *
 * Монгол кирилл үсгийг латинаар СОЛИНО. Кирилл хаяг ажилладаг ч
 * хуваалцахад %D1%85%D0%B0... болж уншигдахгүй болдог.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Хямдралын хувь: 199000, 149000 → 25 */
export function discountPercent(price: number, discount: number): number {
  if (!discount || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100);
}

/**
 * ОГНОО ФОРМАТЛАХ
 *
 * ЦАГИЙН БҮС ЯАГААД ЧУХАЛ ВЭ:
 *   Хуудсууд серверт зурагддаг. Vercel-ийн сервер UTC цагаар
 *   ажилладаг тул бүсийг заахгүй бол Монголын цагаас 8 цаг зөрнө.
 *   Шөнийн 01:00-д хийсэн захиалга өмнөх өдрийн 17:00 гэж харагдана.
 *   Тиймээс бүсийг ЗААВАЛ шууд зааж өгнө.
 *
 * ЯАГААД ГАРААР УГСАРСАН БЭ:
 *   `Intl`-ийн "mn-MN" хэл нь орчноос хамаарч өөр өөр бичдэг
 *   ("2026.9.8", "26/9/8", "9-р сарын 8"). Хэсэг бүрийг нь салгаж
 *   аваад өөрсдөө угсарснаар ХААНА Ч ижил харагдана.
 */
const UB_TIMEZONE = "Asia/Ulaanbaatar";

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: UB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** 2026 оны 9-р сарын 8 → "2026.09.08" */
export function formatDate(date: Date): string {
  const { year, month, day } = dateParts(date);
  return `${year}.${month}.${day}`;
}

/** → "2026.09.08 14:30" */
export function formatDateTime(date: Date): string {
  const { year, month, day, hour, minute } = dateParts(date);
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

/** Жилгүй богино хэлбэр — хүснэгтэд өргөн хэмнэнэ: "09.08 14:30" */
export function formatShortDateTime(date: Date): string {
  const { month, day, hour, minute } = dateParts(date);
  return `${month}.${day} ${hour}:${minute}`;
}
