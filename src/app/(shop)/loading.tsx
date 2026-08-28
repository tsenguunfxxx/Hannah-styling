import { PageHeaderSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Дэлгүүрийн ерөнхий араг яс.
 * Өөрийн loading.tsx-гүй хуудсууд бүгд үүнийг ашиглана.
 */
export default function ShopLoading() {
  return (
    <div className="container-shop py-12 lg:py-16">
      <PageHeaderSkeleton />

      <div className="mt-10 space-y-4">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
