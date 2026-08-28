import { Skeleton } from "@/components/ui/skeleton";

/** Сагс ачаалагдах хүртэлх араг яс */
export default function CartLoading() {
  return (
    <div className="container-shop py-12 lg:py-16">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 mb-10 h-9 w-48" />

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <div className="border-t border-line">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-line py-6 sm:gap-6">
              <Skeleton className="aspect-3/4 w-24 shrink-0 sm:w-28" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-6 h-11 w-32" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
