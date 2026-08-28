import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/shared/price";
import { WishlistButton } from "@/components/product/wishlist-button";
import { discountPercent } from "@/lib/utils";
import type { ProductCardItem } from "@/lib/queries/product.query";

/**
 * Барааны карт — дэлгүүрийн хамгийн олон давтагдах элемент.
 * Нүүр, дэлгүүр, хайлт, холбоотой бараа бүгд ҮҮНИЙГ ашиглана.
 *
 * Зураг дээр hover хийхэд 2 дахь зураг руу солигдоно.
 */
export function ProductCard({
  product,
  inWishlist = false,
  priority = false,
}: {
  product: ProductCardItem;
  inWishlist?: boolean;
  priority?: boolean;
}) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isSoldOut = totalStock === 0;

  // Давхардсан өнгийг нэг удаа харуулна
  const colors = [...new Map(product.variants.map((v) => [v.colorHex, v])).values()];

  const percent = product.discountPrice
    ? discountPercent(product.basePrice, product.discountPrice)
    : 0;

  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-sand">
          {product.images[0] && (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt ?? product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
          )}

          {/* 2 дахь зураг — hover үед гарч ирнэ */}
          {product.images[1] && (
            <Image
              src={product.images[1].url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {percent > 0 && !isSoldOut && (
            <span className="label absolute top-3 left-3 bg-sale px-2 py-1 text-bone">
              -{percent}%
            </span>
          )}

          {isSoldOut && (
            <span className="label absolute top-3 left-3 bg-ink px-2 py-1 text-bone">
              Дууссан
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <p className="label text-graphite">{product.category.name}</p>
          <h3 className="text-sm leading-snug">{product.name}</h3>
          <Price
            basePrice={product.basePrice}
            discountPrice={product.discountPrice}
          />
        </div>
      </Link>

      {/* Өнгөний сонголтууд */}
      {colors.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {colors.map((c) => (
            <span
              key={c.colorHex}
              title={c.color}
              style={{ backgroundColor: c.colorHex }}
              className="size-3 border border-line"
            />
          ))}
        </div>
      )}

      {/* Зүрхэн товч — линкийн ГАДНА байрлана */}
      <WishlistButton
        productId={product.id}
        initialActive={inWishlist}
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 md:opacity-0"
      />
    </article>
  );
}
