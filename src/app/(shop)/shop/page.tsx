import { Suspense } from "react";
import type { Metadata } from "next";

import { parseShopParams } from "@/lib/shop-params";
import { getFilterOptions } from "@/lib/queries/shop.query";
import { FilterPanel } from "@/components/shop/filter-panel";
import { MobileFilters } from "@/components/shop/mobile-filters";
import { ActiveFilters } from "@/components/shop/active-filters";
import { SortSelect } from "@/components/shop/sort-select";
import { ShopResults } from "@/components/shop/shop-results";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

export const metadata: Metadata = { title: "Дэлгүүр" };

/**
 * ДЭЛГҮҮРИЙН ХУУДАС.
 * Бүх filter-ийн төлөв URL дотор байна — /shop?category=gutal&size=41&sort=price-asc
 */
export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const raw = await searchParams;
  const params = parseShopParams(raw);
  const options = await getFilterOptions();

  // Идэвхтэй шүүлтүүрийн тоо — mobile товч дээрх тэмдэг
  const activeCount =
    (params.category ? 1 : 0) +
    params.sizes.length +
    params.colors.length +
    (params.minPrice || params.maxPrice ? 1 : 0) +
    (params.inStock ? 1 : 0) +
    (params.sale ? 1 : 0) +
    (params.featured ? 1 : 0);

  const categoryName = [...options.parentCategories, ...options.childCategories].find(
    (c) => c.slug === params.category,
  )?.name;

  return (
    <div className="container-shop py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="label text-graphite">Дэлгүүр</p>
          <h1 className="mt-2 font-display text-3xl font-medium uppercase tracking-label">
            {categoryName ?? "Бүх бараа"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <MobileFilters
            options={options}
            params={params}
            activeCount={activeCount}
          />
          <SortSelect value={params.sort} />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Desktop шүүлтүүр */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <FilterPanel options={options} params={params} />
        </aside>

        <div>
          <ActiveFilters params={params} categoryName={categoryName} />

          {/*
            key нь filter солигдох бүрд өөрчлөгдөнө → Suspense дахин ажиллаж
            skeleton харагдана. Ингэснээр хэрэглэгч "ямар нэг юм болж байна"
            гэдгийг мэдэрнэ.
          */}
          <Suspense
            key={JSON.stringify(params)}
            fallback={<ProductGridSkeleton />}
          >
            <ShopResults params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
