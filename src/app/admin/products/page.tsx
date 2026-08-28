import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import {
  getAdminProducts,
  getCategoryOptions,
  parseAdminProductFilters,
} from "@/lib/queries/admin/product.query";
import { formatPrice } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/admin/product-filters";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";

export const metadata = { title: "Бараа" };

/**
 * АДМИН — БАРААНЫ ЖАГСААЛТ.
 * Шүүлтүүр URL дотор байдаг тул хуудсыг хуваалцаж болно.
 */
export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const raw = await searchParams;
  const filters = parseAdminProductFilters(raw);

  const [{ products, total, page, totalPages }, categories] = await Promise.all([
    getAdminProducts(filters),
    getCategoryOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-graphite">Нийт {total} бараа</p>
          <h1 className="mt-2 font-display text-2xl font-medium uppercase tracking-label">
            Бараа
          </h1>
        </div>

        <Button
          className="label h-11"
          nativeButton={false}
          render={<Link href="/admin/products/new" />}
        >
          <Plus className="size-4" />
          Шинэ бараа
        </Button>
      </div>

      <ProductFilters
        categories={categories}
        defaults={{
          q: filters.q,
          categoryId: filters.categoryId,
          status: filters.status,
        }}
      />

      {products.length === 0 ? (
        <EmptyState
          title="Бараа олдсонгүй"
          description="Шүүлтүүрээ өөрчлөх эсвэл шинэ бараа нэмнэ үү."
          actionLabel="Шинэ бараа"
          actionHref="/admin/products/new"
        />
      ) : (
        <>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-4xl border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-sand/50">
                  <Th>Бараа</Th>
                  <Th>Ангилал</Th>
                  <Th align="right">Үнэ</Th>
                  <Th align="right">Үлдэгдэл</Th>
                  <Th align="right">Зарагдсан</Th>
                  <Th>Төлөв</Th>
                  <Th align="right">Үйлдэл</Th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-3/4 w-10 shrink-0 overflow-hidden bg-sand">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-graphite">
                            {product.variantCount} размер/өнгө
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-graphite">
                      {product.category.name}
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums">
                      {product.discountPrice ? (
                        <>
                          <span>{formatPrice(product.discountPrice)}</span>
                          <span className="ml-2 text-graphite line-through">
                            {formatPrice(product.basePrice)}
                          </span>
                        </>
                      ) : (
                        formatPrice(product.basePrice)
                      )}
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={
                          product.totalStock === 0
                            ? "text-sale"
                            : product.totalStock <= LOW_STOCK_THRESHOLD
                              ? "text-sale"
                              : ""
                        }
                      >
                        {product.totalStock}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-graphite tabular-nums">
                      {product.soldCount}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={
                            product.isActive
                              ? "label border border-line px-2 py-1"
                              : "label border border-sale px-2 py-1 text-sale"
                          }
                        >
                          {product.isActive ? "Идэвхтэй" : "Нуугдсан"}
                        </span>

                        {product.isFeatured && (
                          <span className="label bg-ink px-2 py-1 text-bone">
                            Онцлох
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <ProductRowActions
                        id={product.id}
                        name={product.name}
                        isActive={product.isActive}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`label px-4 py-3 text-graphite ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}
