import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProductCardItem } from "@/lib/queries/product.query";

/**
 * Барааны сүлжээ.
 * Desktop 4 багана / Tablet 3 / Mobile 2 — даалгаварт заасны дагуу.
 */
export function ProductGrid({
  products,
  wishlistIds = [],
  emptyMessage = "Бараа олдсонгүй.",
  priorityCount = 0,
}: {
  products: ProductCardItem[];
  wishlistIds?: string[];
  emptyMessage?: string;
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          inWishlist={wishlistIds.includes(product.id)}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
