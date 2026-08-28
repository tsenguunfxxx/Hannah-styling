import { cn } from "@/lib/utils";

/**
 * НИЙГМИЙН СҮЛЖЭЭНИЙ ТЭМДЭГ (brand icon)
 *
 * Яагаад гараар зурав?
 *   lucide-react нь брэндийн лого агуулахаа больсон (зохиогчийн эрхийн
 *   шалтгаанаар). Тиймээс албан ёсны хэлбэрийг нь SVG-ээр шууд бичсэн.
 *
 * Бүгд `currentColor` ашиглана — тиймээс хар дэвсгэр дээр цайвар,
 * цайван дэвсгэр дээр хар болж ӨӨРӨӨ тохирно.
 */

type IconProps = { className?: string };

/** Instagram — гаднаа дугуй буланд дөрвөлжин, дотор нь линз */
export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      {/* Дээд баруун булан дахь жижиг цэг */}
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Facebook — дүүрэн "f" үсэг */
export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-5", className)}
      fill="currentColor"
    >
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.33-.04-1.56-.14-2.86-.14C11.93 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5z" />
    </svg>
  );
}

/** Telegram — дүүрэн цаасан онгоц */
export function TelegramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-5", className)}
      fill="currentColor"
    >
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}
