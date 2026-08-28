import { getShopProducts } from "@/lib/queries/shop.query";
import { getWishlistProductIds } from "@/actions/wishlist.action";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import type { ShopParams } from "@/lib/shop-params";

/**
 * Барааны үр дүн.
 * Дэлгүүр болон хайлтын хуудас хоёулаа ҮҮНИЙГ ашиглана.
 * Async Server Component учраас Suspense дотор байрлуулж skeleton харуулж болно.
 */
export async function ShopResults({
  params,
  emptyTitle = "Бараа олдсонгүй.",
  emptyDescription,
}: {
  params: ShopParams;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [{ products, total, page, totalPages }, wishlistIds] = await Promise.all([
    getShopProducts(params),
    getWishlistProductIds(),
  ]);

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={
          emptyDescription ??
          "Шүүлтүүрээ өөрчилж эсвэл арилгаж дахин оролдоно уу."
        }
        actionLabel="Бүх барааг харах"
        actionHref="/shop"
      />
    );
  }

  return (
    <>
      <p className="label mb-6 text-graphite">
        {total} бараа
        {totalPages > 1 && ` · ${page}/${totalPages} хуудас`}
      </p>

      <ProductGrid products={products} wishlistIds={wishlistIds} priorityCount={4} />

      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}
