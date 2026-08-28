import { Skeleton } from "@/components/ui/skeleton";

/**
 * Дахин ашиглагдах араг ясны хэсгүүд.
 *
 * Араг яс нь ЖИНХЭНЭ агуулгынхаа хэлбэртэй байх ёстой. Тэгвэл
 * өгөгдөл ирэхэд хуудас "үсрэхгүй" — нүд аль хэдийн байрлалыг
 * тогтоосон байна.
 */

/** Хуудасны гарчиг: жижиг тайлбар + том гарчиг */
export function PageHeaderSkeleton({ width = "16rem" }: { width?: string }) {
  return (
    <div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9" style={{ width }} />
    </div>
  );
}

/** Хүснэгтийн араг яс */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="border border-line">
      {/* Толгой мөр */}
      <div className="flex gap-4 border-b border-line bg-sand/50 px-4 py-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="ml-auto h-3 w-20" />
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0"
        >
          <Skeleton className="size-10 shrink-0" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Картуудын сүлжээ (хүслийн жагсаалт, ангилал гэх мэт) */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-3/4 w-full" />
          <Skeleton className="mt-3 h-3 w-16" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
