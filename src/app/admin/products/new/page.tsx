import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCategoryOptions } from "@/lib/queries/admin/product.query";
import { ProductForm } from "@/components/admin/product-form";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Шинэ бараа" };

export default async function NewProductPage() {
  const categories = await getCategoryOptions();

  // Ангилалгүйгээр бараа үүсгэх боломжгүй
  if (categories.length === 0) {
    return (
      <EmptyState
        title="Эхлээд ангилал үүсгэнэ үү"
        description="Бараа заавал ангилалд хамаарах ёстой."
        actionLabel="Ангилал руу очих"
        actionHref="/admin/categories"
      />
    );
  }

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

        <h1 className="mt-3 font-display text-2xl font-medium uppercase tracking-label">
          Шинэ бараа
        </h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
