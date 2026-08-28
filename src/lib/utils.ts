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
