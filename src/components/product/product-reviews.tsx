import { StarRating } from "@/components/product/star-rating";
import type { ProductReview } from "@/lib/queries/product.query";

/** Огноог "2026 оны 3 сарын 14" хэлбэрээр */
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Нэрийг "Батбаяр" → "Б." болгож нууцлана */
function maskName(name: string | null) {
  if (!name) return "Хэрэглэгч";
  const [first] = name.trim().split(" ");
  return first.length <= 2 ? first : `${first.slice(0, 1)}${"*".repeat(2)}`;
}

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  if (reviews.length === 0) {
    return (
      <p className="py-6 text-sm text-graphite">
        Энэ бараанд одоогоор сэтгэгдэл байхгүй байна. Худалдан авсны дараа
        хамгийн түрүүнд сэтгэгдлээ үлдээгээрэй.
      </p>
    );
  }

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div>
      {/* Дундаж үнэлгээ */}
      <div className="flex items-center gap-4 border-b border-line pb-6">
        <span className="font-display text-3xl">{average.toFixed(1)}</span>
        <div>
          <StarRating rating={average} size="lg" />
          <p className="label mt-1 text-graphite">
            {reviews.length} сэтгэгдэл
          </p>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {reviews.map((review) => (
          <li key={review.id} className="py-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {maskName(review.user.name)}
              </span>
              <span className="label text-graphite">
                {formatDate(review.createdAt)}
              </span>
            </div>

            <StarRating rating={review.rating} className="mt-2" />

            {review.comment && (
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-graphite">
                {review.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
