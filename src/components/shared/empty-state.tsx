import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Хоосон төлөв. Бараа олдоогүй, сагс хоосон зэрэг тохиолдолд.
 * Хоосон дэлгэц хэзээ ч цоо хоосон байх ёсгүй — юу хийхийг зааж өгнө.
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-line px-6 py-20 text-center">
      <PackageOpen className="size-8 text-graphite" strokeWidth={1.2} />
      <p className="mt-5 font-display text-lg uppercase tracking-label">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-graphite">{description}</p>
      )}
      {actionLabel && actionHref && (
        // nativeButton={false} — доор нь <a> болж render хийгдэж байгааг Base UI-д хэлнэ
        <Button
          className="label mt-8"
          nativeButton={false}
          render={<Link href={actionHref} />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
