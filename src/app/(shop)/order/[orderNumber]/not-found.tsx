import { EmptyState } from "@/components/shared/empty-state";

/**
 * Захиалга олдоогүй.
 * Өөрийнх биш захиалга руу орох гэсэн үед ч ЯГ ЭНЭ хуудас гарна —
 * "байгаа ч чинийх биш" гэж хэлэхгүй.
 */
export default function OrderNotFound() {
  return (
    <div className="container-shop py-24">
      <EmptyState
        title="Захиалга олдсонгүй"
        description="Захиалгын дугаар буруу эсвэл энэ захиалга танийх биш байна."
        actionLabel="Миний захиалга"
        actionHref="/account/orders"
      />
    </div>
  );
}
