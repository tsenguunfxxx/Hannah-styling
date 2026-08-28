"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { deleteReviewAction, saveReviewAction } from "@/actions/review.action";
import type { ReviewEligibility } from "@/lib/queries/review.query";

/**
 * Сэтгэгдэл бичих маягт.
 *
 * Дөрвөн тохиолдол:
 *   1. Нэвтрээгүй        → нэвтрэх санал
 *   2. Аваагүй           → зөвхөн худалдан авсан хүн бичнэ гэж тайлбарлана
 *   3. Аваад бичээгүй    → маягт
 *   4. Аль хэдийн бичсэн → засах, устгах
 */
export function ReviewForm({
  productId,
  eligibility,
}: {
  productId: string;
  eligibility: ReviewEligibility;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [rating, setRating] = useState(eligibility.myReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(eligibility.myReview?.comment ?? "");

  if (!eligibility.signedIn) {
    return (
      <Hint>
        Сэтгэгдэл бичихийн тулд{" "}
        <Link href="/login" className="underline underline-offset-4">
          нэвтэрнэ үү
        </Link>
        .
      </Hint>
    );
  }

  if (!eligibility.canReview) {
    return (
      <Hint>
        Зөвхөн энэ барааг худалдаж аваад хүлээн авсан хүн сэтгэгдэл бичих
        боломжтой.
      </Hint>
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveReviewAction(productId, {
        rating,
        comment: comment.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        eligibility.myReview ? "Сэтгэгдэл шинэчлэгдлээ." : "Баярлалаа!",
      );
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteReviewAction(productId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setRating(0);
      setComment("");
      toast.success("Сэтгэгдэл устлаа.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line p-5">
      <p className="label text-graphite">
        {eligibility.myReview ? "Таны сэтгэгдэл" : "Сэтгэгдэл бичих"}
      </p>

      {/* Оддын сонголт */}
      <div
        className="mt-4 flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            aria-label={`${star} од`}
            aria-pressed={rating === star}
            className="p-1"
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                star <= (hovered || rating)
                  ? "fill-ink stroke-ink"
                  : "stroke-line",
              )}
            />
          </button>
        ))}

        {rating > 0 && (
          <span className="label ml-2 text-graphite">{rating}/5</span>
        )}
      </div>

      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Материал, размер, чанарын талаар бусдад тустай зүйл бичээрэй. (заавал биш)"
        className="mt-4"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={isPending || rating === 0}
          className="label h-11"
        >
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          {eligibility.myReview ? "Шинэчлэх" : "Илгээх"}
        </Button>

        {eligibility.myReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="label inline-flex items-center gap-2 text-graphite underline underline-offset-4 transition-colors hover:text-sale disabled:opacity-40"
          >
            <Trash2 className="size-3.5" />
            Устгах
          </button>
        )}
      </div>
    </form>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-line px-4 py-5 text-sm text-graphite">
      {children}
    </p>
  );
}
