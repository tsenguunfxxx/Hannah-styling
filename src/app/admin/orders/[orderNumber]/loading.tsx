import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrderLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-8 w-56" />
      </div>

      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-28 w-full" />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
