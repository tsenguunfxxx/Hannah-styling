import { EmptyState } from "@/components/shared/empty-state";

/**
 * Байхгүй бараа руу орвол энэ хуудас гарна.
 * page.tsx доторх notFound() үүнийг дуудна.
 */
export default function ProductNotFound() {
  return (
    <div className="container-shop py-24">
      <EmptyState
        title="Бараа олдсонгүй"
        description="Таны хайж буй бараа устсан эсвэл хаяг нь буруу байна."
        actionLabel="Дэлгүүр рүү буцах"
        actionHref="/shop"
      />
    </div>
  );
}
