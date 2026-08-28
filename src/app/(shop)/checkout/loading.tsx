import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="container-shop py-12 lg:py-16">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 mb-10 h-9 w-72" />

      <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-16">
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
