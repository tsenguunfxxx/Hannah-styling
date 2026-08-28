import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminListLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton width="12rem" />

      {/* Шүүлтүүрийн мөр */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-28" />
      </div>

      <TableSkeleton />
    </div>
  );
}
