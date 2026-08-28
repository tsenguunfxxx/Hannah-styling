import { Suspense } from "react";
import type { Metadata } from "next";

import { parseShopParams } from "@/lib/shop-params";
import { SortSelect } from "@/components/shop/sort-select";
import { ShopResults } from "@/components/shop/shop-results";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Хайлт" };

/**
 * ХАЙЛТЫН ХУУДАС.
 * Барааны нэр, тайлбар, ангилалаас хайна (том жижиг үсэг ялгахгүй).
 */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const raw = await searchParams;
  const params = parseShopParams(raw);

  return (
    <div className="container-shop py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="label text-graphite">Хайлтын үр дүн</p>
          <h1 className="mt-2 font-display text-3xl font-medium uppercase tracking-label">
            {params.q ? `“${params.q}”` : "Хайлт"}
          </h1>
        </div>

        {params.q && <SortSelect value={params.sort} />}
      </div>

      {!params.q ? (
        <EmptyState
          title="Хайх үгээ оруулна уу"
          description="Дээд талын хайлтын товч дээр дарж барааны нэр эсвэл ангилал бичнэ үү."
          actionLabel="Бүх барааг харах"
          actionHref="/shop"
        />
      ) : (
        <Suspense key={JSON.stringify(params)} fallback={<ProductGridSkeleton count={8} />}>
          <ShopResults
            params={params}
            emptyTitle="Таны хайлттай тохирох бараа олдсонгүй."
            emptyDescription="Өөр үгээр хайж үзэх эсвэл бүх барааг харна уу."
          />
        </Suspense>
      )}
    </div>
  );
}
