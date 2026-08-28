import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {
  getCategoryOptions,
  getProductForEdit,
} from "@/lib/queries/admin/product.query";
import { ProductForm } from "@/components/admin/product-form";

export async function generateMetadata({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  const product = await getProductForEdit(id);

  return { title: product ? `${product.name} — засах` : "Бараа олдсонгүй" };
}

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductForEdit(id),
    getCategoryOptions(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="label inline-flex items-center gap-2 text-graphite transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Бараа руу буцах
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-2xl font-medium uppercase tracking-label">
            {product.name}
          </h1>

          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="label inline-flex items-center gap-1.5 text-graphite transition-colors hover:text-ink"
          >
            Дэлгүүрт харах
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      <ProductForm
        categories={categories}
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          details: product.details,
          basePrice: product.basePrice,
          discountPrice: product.discountPrice,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images,
          variants: product.variants,
        }}
      />
    </div>
  );
}
