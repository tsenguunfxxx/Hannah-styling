import { Skeleton } from "@/components/ui/skeleton";

/**
 * Барааны хуудас ачаалагдах хүртэлх араг яс.
 * Хоосон цагаан дэлгэц харуулахгүй — хаана юу гарахыг урьдчилан үзүүлнэ.
 */
export default function ProductLoading() {
  return (
    <div className="container-shop py-8 lg:py-12">
      <Skeleton className="mb-8 h-3 w-64" />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
          <div className="order-2 flex gap-3 lg:order-1 lg:w-20 lg:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-3/4 w-16 lg:w-full" />
            ))}
          </div>
          <Skeleton className="order-1 aspect-3/4 flex-1 lg:order-2" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
