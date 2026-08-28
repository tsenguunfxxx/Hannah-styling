import Image from "next/image";
import Link from "next/link";

import { SectionHeader } from "@/components/shared/section-header";
import type { MainCategory } from "@/lib/queries/category.query";

/** Нүүр хуудасны ангиллын хэсэг */
export function CategoryGrid({ categories }: { categories: MainCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-shop py-16 lg:py-24">
      <SectionHeader eyebrow="Ангилал" title="Юу хайж байна вэ?" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative aspect-4/5 overflow-hidden bg-sand"
          >
            {category.image && (
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}

            <div
              aria-hidden
              className="absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/40"
            />

            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-display text-lg font-medium uppercase tracking-label text-bone">
                {category.name}
              </p>
              <p className="label mt-1 text-bone/70">
                {category._count.products > 0
                  ? `${category._count.products} бараа`
                  : `${category._count.children} дэд ангилал`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
