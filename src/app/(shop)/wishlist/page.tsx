import Image from "next/image";
import Link from "next/link";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/shared/price";
import { EmptyState } from "@/components/shared/empty-state";
import { WishlistButton } from "@/components/product/wishlist-button";

export const metadata = { title: "Хүслийн жагсаалт" };

export default async function WishlistPage() {
  const { user } = await requireAuth();

  const items = await prisma.wishlistItem.findMany({
    where: { wishlist: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          discountPrice: true,
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  return (
    <div className="container-shop py-12 lg:py-16">
      <p className="label text-graphite">{items.length} бараа</p>
      <h1 className="mt-3 mb-10 font-display text-3xl font-medium uppercase tracking-label">
        Хүслийн жагсаалт
      </h1>

      {items.length === 0 ? (
        <EmptyState
          title="Жагсаалт хоосон байна"
          description="Барааны зураг дээрх зүрх дээр дарж дуртай бараагаа хадгална."
          actionLabel="Дэлгүүр рүү очих"
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map(({ id, product }) => (
            <article key={id} className="group relative">
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-3/4 overflow-hidden bg-sand">
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                </div>

                <p className="label mt-3 text-graphite">{product.category.name}</p>
                <h2 className="mt-1 text-sm">{product.name}</h2>
                <Price
                  basePrice={product.basePrice}
                  discountPrice={product.discountPrice}
                  className="mt-1"
                />
              </Link>

              <WishlistButton
                productId={product.id}
                initialActive
                className="absolute top-2 right-2"
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
