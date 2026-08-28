import { EmptyState } from "@/components/shared/empty-state";

export default function AdminOrderNotFound() {
  return (
    <EmptyState
      title="Захиалга олдсонгүй"
      description="Ийм дугаартай захиалга бүртгэгдээгүй байна."
      actionLabel="Захиалгын жагсаалт"
      actionHref="/admin/orders"
    />
  );
}
