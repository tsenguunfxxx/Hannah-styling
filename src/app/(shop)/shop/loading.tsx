import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

/** Дэлгүүрийн хуудас анх ачаалагдах үед */
export default function ShopLoading() {
  return (
    <div className="container-shop py-10 lg:py-14">
      <div className="mb-8 border-b border-line pb-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-8 w-48" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
        <div className="hidden space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>

        <ProductGridSkeleton />
      </div>
    </div>
  );
}
