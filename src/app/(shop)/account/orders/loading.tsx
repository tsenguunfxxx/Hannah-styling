import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="container-shop py-12 lg:py-16">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 mb-10 h-9 w-64" />

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
