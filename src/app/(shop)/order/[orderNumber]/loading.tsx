import { Skeleton } from "@/components/ui/skeleton";

export default function OrderLoading() {
  return (
    <div className="container-shop py-12 lg:py-16">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-48" />

      {/* Явцын зам */}
      <Skeleton className="mt-10 h-24 w-full" />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-2">
              <Skeleton className="aspect-3/4 w-16 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
