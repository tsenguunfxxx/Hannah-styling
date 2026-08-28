import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { OrderStatus } from "@/generated/prisma/enums";

/**
 * Админы хяналтын самбарын тоо баримт.
 *
 * ЧУХАЛ: Цуцлагдсан захиалгыг орлогод ТООЦОХГҮЙ.
 * Үгүй бол "борлуулалт" гэсэн тоо худал болно.
 */

/** Тухайн өдрийн 00:00 */
function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Тухайн сарын 1-ний 00:00 */
function startOfMonth(date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Орлогод тооцох захиалгын шүүлтүүр */
const REVENUE_WHERE = { status: { not: "CANCELLED" as OrderStatus } };

/** Хугацааны хүрээн дэх орлого ба захиалгын тоо */
async function revenueSince(since?: Date) {
  const result = await prisma.order.aggregate({
    where: since
      ? { ...REVENUE_WHERE, createdAt: { gte: since } }
      : REVENUE_WHERE,
    _sum: { total: true },
    _count: true,
  });

  return {
    revenue: result._sum.total ?? 0,
    orders: result._count,
  };
}

/** Дээд талын 4 тоон хайрцаг */
export async function getDashboardStats() {
  const today = startOfDay();
  const month = startOfMonth();

  const [todayStats, monthStats, allTime, customers, pendingOrders] =
    await Promise.all([
      revenueSince(today),
      revenueSince(month),
      revenueSince(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  return { todayStats, monthStats, allTime, customers, pendingOrders };
}

/**
 * Сүүлийн 14 хоногийн өдөр тутмын орлого.
 *
 * Database-д "өдрөөр бүлэглэх" нь SQL бичихийг шаардана.
 * 14 хоногийн захиалга цөөхөн тул JavaScript дээр бүлэглэх нь
 * хялбар бөгөөд хангалттай хурдан.
 */
export async function getRevenueByDay(days = 14) {
  const since = startOfDay();
  since.setDate(since.getDate() - (days - 1));

  const orders = await prisma.order.findMany({
    where: { ...REVENUE_WHERE, createdAt: { gte: since } },
    select: { createdAt: true, total: true },
  });

  // Эхлээд бүх өдрийг 0-ээр дүүргэнэ — захиалгагүй өдөр ч графикт харагдана
  const buckets = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    buckets.set(toKey(day), 0);
  }

  for (const order of orders) {
    const key = toKey(order.createdAt);
    buckets.set(key, (buckets.get(key) ?? 0) + order.total);
  }

  return [...buckets.entries()].map(([date, total]) => ({ date, total }));
}

function toKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Төлөв бүрийн захиалгын тоо */
export async function getOrderStatusCounts() {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  // Map болгож хувиргана — байхгүй төлөв 0 болно
  const counts = new Map<OrderStatus, number>();
  for (const row of grouped) counts.set(row.status, row._count);

  return counts;
}

/** Сүүлийн захиалгууд */
export async function getRecentOrders(limit = 6) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      status: true,
      total: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });
}

/**
 * Үлдэгдэл дуусах гэж буй variant-ууд.
 * Админ юуг эхэлж нөхөх ёстойгоо шууд харна.
 */
export async function getLowStockVariants(limit = 8) {
  return prisma.productVariant.findMany({
    where: {
      stock: { lte: LOW_STOCK_THRESHOLD },
      product: { isActive: true },
    },
    orderBy: [{ stock: "asc" }, { id: "asc" }],
    take: limit,
    select: {
      id: true,
      size: true,
      color: true,
      stock: true,
      product: { select: { name: true, slug: true } },
    },
  });
}

/** Хамгийн их зарагдсан бараа */
export async function getTopProducts(limit = 5) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { soldCount: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      soldCount: true,
      effectivePrice: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });
}

export type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];
export type LowStockVariant = Awaited<
  ReturnType<typeof getLowStockVariants>
>[number];
export type TopProduct = Awaited<ReturnType<typeof getTopProducts>>[number];
export type RevenuePoint = Awaited<ReturnType<typeof getRevenueByDay>>[number];
