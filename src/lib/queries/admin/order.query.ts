import { prisma } from "@/lib/prisma";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

/** Нэг хуудсанд хэдэн захиалга */
export const ORDERS_PAGE_SIZE = 20;

export type AdminOrderFilters = {
  q: string;
  status: OrderStatusKey | "all";
  page: number;
};

/** Тухайн утга захиалгын төлөв мөн эсэх */
function isOrderStatus(value: unknown): value is OrderStatusKey {
  return typeof value === "string" && value in ORDER_STATUS;
}

/** URL-ийн түүхий утгыг найдвартай хэлбэрт оруулна */
export function parseAdminOrderFilters(
  raw: Record<string, string | string[] | undefined>,
): AdminOrderFilters {
  const page = Number(raw.page);

  return {
    q: typeof raw.q === "string" ? raw.q.trim() : "",
    status: isOrderStatus(raw.status) ? raw.status : "all",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

function buildWhere(filters: AdminOrderFilters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status !== "all") where.status = filters.status;

  // Дугаар, нэр, утсаар нэгэн зэрэг хайна
  if (filters.q) {
    where.OR = [
      { orderNumber: { contains: filters.q, mode: "insensitive" } },
      { customerName: { contains: filters.q, mode: "insensitive" } },
      { phone: { contains: filters.q } },
    ];
  }

  return where;
}

/** Админы захиалгын жагсаалт */
export async function getAdminOrders(filters: AdminOrderFilters) {
  const where = buildWhere(filters);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        status: true,
        total: true,
        createdAt: true,
        payment: { select: { method: true, status: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
  };
}

/**
 * Админы захиалгын дэлгэрэнгүй.
 *
 * Хэрэглэгчийн талын getOrderByNumber-ээс ялгаатай нь эзэмшлийг шалгахгүй —
 * админ бүх захиалгыг харна. Эрхийн шалгалт нь /admin layout дээр.
 */
export async function getAdminOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { orderBy: { id: "asc" } },
      payment: true,
      coupon: { select: { code: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

/** Шүүлтүүрийн товч дээр харуулах тоо */
export async function getOrderStatusTabs() {
  const grouped = await prisma.order.groupBy({ by: ["status"], _count: true });
  const total = grouped.reduce((sum, row) => sum + row._count, 0);

  const counts = new Map<OrderStatusKey, number>();
  for (const row of grouped) counts.set(row.status, row._count);

  return { total, counts };
}

export type AdminOrderRow = Awaited<
  ReturnType<typeof getAdminOrders>
>["orders"][number];

export type AdminOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getAdminOrderByNumber>>
>;
