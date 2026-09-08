import { cn } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";

/**
 * Захиалгын төлвийн шошго.
 * Монгол нэрийг constants.ts-аас авна — нэг л газраас засварлана.
 */

/*
  Өнгө нь ЯВЦЫГ илэрхийлнэ — админ жагсаалт харахад нэг харцаар
  ялгагдах ёстой:

    Хүлээгдэж байна  — шаргал, "анхаарал хэрэгтэй"
    Баталгаажсан     — хар хүрээ, ажил эхэлсэн
    Бэлтгэж байна    — хар хүрээ (хуучин захиалгуудад л үлдсэн)
    Хүргэлтэнд гарсан— дүүрэн хар, идэвхтэй хөдөлгөөнд
    Хүргэгдсэн       — ногоон, амжилттай дууссан
    Цуцлагдсан       — улаан, зогссон
*/
const STYLES: Record<OrderStatusKey, string> = {
  PENDING: "border-pending/40 bg-pending/10 text-pending",
  CONFIRMED: "border-ink text-ink",
  PROCESSING: "border-ink text-ink",
  SHIPPED: "border-ink bg-ink text-bone",
  DELIVERED: "border-success/40 bg-success/10 text-success",
  CANCELLED: "border-sale/40 bg-sale/10 text-sale",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatusKey;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label inline-block border px-2.5 py-1",
        STYLES[status],
        className,
      )}
    >
      {ORDER_STATUS[status].label}
    </span>
  );
}
