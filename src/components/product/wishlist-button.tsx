"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/actions/wishlist.action";

/**
 * Зүрхэн товч. Дарахад шууд өнгө нь солигдоно (optimistic),
 * сервер хариу ирэхээс хүлээхгүй — хэрэглэгчид хурдан мэдрэгдэнэ.
 */
export function WishlistButton({
  productId,
  initialActive = false,
  className,
}: {
  productId: string;
  initialActive?: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(initialActive);

  /*
    Дарах бүрд зүрх нэг удаа "цохилно".

    Зөвхөн `active`-аас хамааруулж болохгүй байсан: хүслийн
    жагсаалтад аль хэдийн байгаа бараанууд хуудас ачаалагдах бүрд
    цохилж, дэлгүүр бүхэлдээ жиргэх байв. Тиймээс ХЭРЭГЛЭГЧ дарсан
    үед л асаана.
  */
  const [bump, setBump] = useState(false);
  const bumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (bumpTimer.current) clearTimeout(bumpTimer.current);
    };
  }, []);

  function handleClick(event: React.MouseEvent) {
    // Карт бүхэлдээ линк тул дотор нь дарахад хуудас солигдохоос сэргийлнэ
    event.preventDefault();
    event.stopPropagation();

    // Хөдөлгөөнийг эхнээс нь дахин эхлүүлэхийн тулд эхлээд унтраана
    setBump(false);
    if (bumpTimer.current) clearTimeout(bumpTimer.current);

    requestAnimationFrame(() => {
      setBump(true);
      bumpTimer.current = setTimeout(() => setBump(false), 450);
    });

    startTransition(async () => {
      setActive(!active);
      const result = await toggleWishlistAction(productId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.added ? "Хүслийн жагсаалтад нэмлээ." : "Жагсаалтаас хаслаа.");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={active ? "Хүслийн жагсаалтаас хасах" : "Хүслийн жагсаалтад нэмэх"}
      aria-pressed={active}
      className={cn(
        "grid size-9 place-items-center bg-bone/80 backdrop-blur-sm transition-colors hover:bg-bone",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-all",
          active && "fill-ink stroke-ink",
          bump && "heart-pop",
        )}
      />
    </button>
  );
}
