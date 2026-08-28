import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Нүүр хуудасны хэсэг бүрийн гарчиг.
 * Зүүн талд гарчиг, баруун талд "бүгдийг харах" холбоос.
 */
export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "Бүгдийг харах",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-4">
      <div>
        {eyebrow && <p className="label text-graphite">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-2xl font-medium uppercase tracking-label sm:text-3xl">
          {title}
        </h2>
      </div>

      {href && (
        <Link
          href={href}
          className="label group hidden shrink-0 items-center gap-2 pb-1 transition-colors hover:text-graphite sm:flex"
        >
          {linkLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
