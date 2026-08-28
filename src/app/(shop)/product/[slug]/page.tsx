import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";

import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries/product.query";
import { getWishlistProductIds } from "@/actions/wishlist.action";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, SITE } from "@/lib/constants";

import { ProductGallery } from "@/components/product/product-gallery";
import { VariantPicker } from "@/components/product/variant-picker";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductReviews } from "@/components/product/product-reviews";
import { ReviewForm } from "@/components/product/review-form";
import { getReviewEligibility } from "@/lib/queries/review.query";
import { ProductGrid } from "@/components/product/product-grid";
import { StarRating } from "@/components/product/star-rating";
import { SectionHeader } from "@/components/shared/section-header";

/**
 * БАРААНЫ ДЭЛГЭРЭНГҮЙ ХУУДАС.
 *
 * Server Component — өгөгдөл серверт бэлдэгдэнэ.
 * Зөвхөн сонголт хийдэг хэсгүүд нь Client Component.
 */

/** Хайлтын систем болон нийгмийн сүлжээнд харагдах мэдээлэл */
export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Бараа олдсонгүй" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | ${SITE.name}`,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  // Байхгүй эсвэл идэвхгүй бол 404
  if (!product) notFound();

  // Үлдсэн хоёр асуулгыг ЗЭРЭГ явуулна
  const [related, wishlistIds, reviewEligibility] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    getWishlistProductIds(),
    getReviewEligibility(product.id),
  ]);

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="container-shop py-8 lg:py-12">
      {/* Замын мөр */}
      <nav
        aria-label="Замын мөр"
        className="label mb-8 flex flex-wrap items-center gap-2 text-graphite"
      >
        <Link href="/" className="transition-colors hover:text-ink">
          Нүүр
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="transition-colors hover:text-ink"
        >
          {product.category.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        {/* Мэдээлэл — desktop дээр гүйлгэхэд наалдаж үлдэнэ */}
        <div className="min-w-0 lg:sticky lg:top-24 lg:h-fit lg:self-start">
          <p className="label text-graphite">{product.category.name}</p>

          <h1 className="mt-3 font-display text-2xl font-medium uppercase tracking-label sm:text-3xl">
            {product.name}
          </h1>

          {product.reviews.length > 0 && (
            <a
              href="#tabs"
              className="mt-3 inline-flex items-center gap-2 text-xs text-graphite transition-colors hover:text-ink"
            >
              <StarRating rating={averageRating} />
              <span>{product.reviews.length} сэтгэгдэл</span>
            </a>
          )}

          <VariantPicker
            productId={product.id}
            basePrice={product.basePrice}
            discountPrice={product.discountPrice}
            variants={product.variants}
            inWishlist={wishlistIds.includes(product.id)}
          />

          {/* Үйлчилгээний баталгаа */}
          <ul className="mt-10 space-y-3 border-t border-line pt-6 text-sm text-graphite">
            <Guarantee icon={Truck}>
              {formatPrice(FREE_SHIPPING_THRESHOLD)}-с дээш захиалгад хүргэлт
              үнэгүй
            </Guarantee>
            <Guarantee icon={RefreshCw}>
              14 хоногийн дотор буцаах, солих боломжтой
            </Guarantee>
            <Guarantee icon={ShieldCheck}>
              Албан ёсны баталгаат бүтээгдэхүүн
            </Guarantee>
          </ul>
        </div>
      </div>

      {/* Табууд */}
      <section id="tabs" className="mt-20 scroll-mt-24 lg:mt-28">
        <ProductTabs
          description={product.description}
          details={product.details}
          reviewCount={product.reviews.length}
          reviews={
            <div className="space-y-8">
              {/* Бичих маягт эхэнд — үйлдэл нүдэнд шууд өртөнө */}
              <ReviewForm
                productId={product.id}
                eligibility={reviewEligibility}
              />
              <ProductReviews reviews={product.reviews} />
            </div>
          }
        />
      </section>

      {/* Холбоотой бараа */}
      {related.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <SectionHeader
            eyebrow="Танд санал болгох"
            title="Төстэй бараа"
            href={`/shop?category=${product.category.slug}`}
          />
          <ProductGrid products={related} wishlistIds={wishlistIds} />
        </section>
      )}
    </div>
  );
}

/** Үйлчилгээний нөхцөлийн нэг мөр */
function Guarantee({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-ink" />
      {children}
    </li>
  );
}
