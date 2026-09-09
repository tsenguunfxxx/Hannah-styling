import {
  getNewArrivals,
  getBestSellers,
  getSaleProducts,
} from "@/lib/queries/product.query";
import { getMainCategories } from "@/lib/queries/category.query";
import { getWishlistProductIds } from "@/actions/wishlist.action";

import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeader } from "@/components/shared/section-header";

/**
 * НҮҮР ХУУДАС.
 * Server Component — бүх өгөгдөл серверт бэлдэгдээд ирнэ.
 * Ямар ч бараа хатуу бичээгүй, бүгд database-аас.
 */
export default async function HomePage() {
  // Бүх асуулгыг ЗЭРЭГ явуулна — нэг нэгээр хүлээвэл удаан болно
  const [newArrivals, bestSellers, saleProducts, categories, wishlistIds] =
    await Promise.all([
      getNewArrivals(8),
      getBestSellers(4),
      getSaleProducts(4),
      getMainCategories(),
      getWishlistProductIds(),
    ]);

  return (
    <>
      <Hero />

      {/* Шинэ бараа */}
      <section className="container-shop py-16 lg:py-24">
        <SectionHeader
          eyebrow="Just in"
          title="Шинэ бараа"
          href="/shop?sort=newest"
        />
        <ProductGrid
          products={newArrivals}
          wishlistIds={wishlistIds}
          priorityCount={4}
          emptyMessage="Шинэ бараа удахгүй нэмэгдэнэ."
        />
      </section>

      <CategoryGrid categories={categories} />

      {/* Хамгийн их зарагдсан */}
      <section className="container-shop py-16 lg:py-24">
        <SectionHeader
          eyebrow="Best sellers"
          title="Хамгийн их зарагдсан"
          href="/shop?sort=best-selling"
        />
        <ProductGrid
          products={bestSellers}
          wishlistIds={wishlistIds}
          emptyMessage="Одоогоор борлуулалт бүртгэгдээгүй."
        />
      </section>

      {/* Хямдрал */}
      {saleProducts.length > 0 && (
        <section className="container-shop py-16 lg:py-24">
          <SectionHeader
            eyebrow="Sale"
            title="Хямдралтай бараа"
            href="/shop?sale=true"
          />
          <ProductGrid products={saleProducts} wishlistIds={wishlistIds} />
        </section>
      )}
    </>
  );
}
