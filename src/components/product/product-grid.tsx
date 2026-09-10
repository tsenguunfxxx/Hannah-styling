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
        /*
          Карт бүр өмнөхөөсөө 55мс хожуу гарч ирнэ — жагсаалт
          дээрээс доош "цуварч" нээгдэнэ.

          Хоцролтыг 8 картаар ХЯЗГААРЛАСАН. Үгүй бол 40 дэх карт
          хоёр секунд хүлээх бөгөөд доош гүйлгэсэн хүн хоосон
          дэлгэц харна. 8-аас цааш бүгд зэрэг гарна — нүд ямар ч
          байсан эхний хэдийг л дагадаг.

          `key`-д индексийг залгасан нь санаатай: шүүлтүүр солиход
          React элементийг дахин ашиглавал хөдөлгөөн дахин
          эхлэхгүй. Түлхүүр солигдоход шинээр үүсч, жагсаалт
          дахин цувран нээгдэнэ.
        */
        <div
          key={`${product.id}-${index}`}
          className="reveal-up"
          style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
        >
          <ProductCard
            product={product}
            inWishlist={wishlistIds.includes(product.id)}
            priority={index < priorityCount}
          />
        </div>
      ))}
    </div>
  );
}
