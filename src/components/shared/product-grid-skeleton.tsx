import { Skeleton } from "@/components/ui/skeleton";

/** Бараа ачаалагдаж байх үеийн саарал хайрцгууд */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-3/4 w-full" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      ))}
    </div>
  );
}
