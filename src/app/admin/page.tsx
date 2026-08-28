import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CircleAlert,
  Clock,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  getDashboardStats,
  getLowStockVariants,
  getOrderStatusCounts,
  getRecentOrders,
  getRevenueByDay,
  getTopProducts,
} from "@/lib/queries/admin/stats.query";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/constants";

import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusBadge } from "@/components/order/order-status-badge";

export const metadata = { title: "Хяналтын самбар" };

/**
 * АДМИН — ХЯНАЛТЫН САМБАР.
 *
 * Бүх асуулгыг Promise.all-аар ЗЭРЭГ явуулна.
 * Нэг нэгээр нь хүлээвэл 8 асуулгын хугацаа нийлж удаан болно.
 */
export default async function AdminDashboardPage() {
  const [stats, revenueByDay, statusCounts, recentOrders, lowStock, topProducts] =
    await Promise.all([
      getDashboardStats(),
      getRevenueByDay(14),
      getOrderStatusCounts(),
      getRecentOrders(6),
      getLowStockVariants(8),
      getTopProducts(5),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="label text-graphite">Тойм</p>
        <h1 className="mt-2 font-display text-2xl font-medium uppercase tracking-label">
          Хяналтын самбар
        </h1>
      </div>

      {/* Тоон хайрцгууд */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Өнөөдрийн орлого"
          value={formatPrice(stats.todayStats.revenue)}
          hint={`${stats.todayStats.orders} захиалга`}
          icon={TrendingUp}
        />
        <StatCard
          label="Энэ сарын орлого"
          value={formatPrice(stats.monthStats.revenue)}
          hint={`${stats.monthStats.orders} захиалга`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Нийт орлого"
          value={formatPrice(stats.allTime.revenue)}
          hint={`${stats.allTime.orders} захиалга`}
          icon={TrendingUp}
        />
        <StatCard
          label="Хүлээгдэж буй"
          value={String(stats.pendingOrders)}
          hint="Баталгаажуулах шаардлагатай"
          icon={Clock}
          accent={stats.pendingOrders > 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueByDay} />
        </div>

        {/* Төлвийн задаргаа */}
        <div className="border border-line p-5">
          <h2 className="label text-graphite">Захиалгын төлөв</h2>

          <dl className="mt-5 space-y-3 text-sm">
            {(Object.keys(ORDER_STATUS) as OrderStatusKey[]).map((status) => (
              <div key={status} className="flex items-center justify-between gap-3">
                <dt className="text-graphite">{ORDER_STATUS[status].label}</dt>
                <dd className="tabular-nums">{statusCounts.get(status) ?? 0}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="label text-graphite">Хэрэглэгч</span>
            <span className="inline-flex items-center gap-2 tabular-nums">
              <Users className="size-3.5 text-graphite" />
              {stats.customers}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Сүүлийн захиалгууд */}
        <section className="border border-line p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="label text-graphite">Сүүлийн захиалга</h2>
            <Link
              href="/admin/orders"
              className="label group inline-flex items-center gap-1.5 transition-colors hover:text-graphite"
            >
              Бүгд
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-graphite">
              Одоогоор захиалга бүртгэгдээгүй байна.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recentOrders.map((order) => (
                <li key={order.id} className="py-3">
                  <Link
                    href={`/admin/orders/${order.orderNumber}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm tracking-label">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-graphite">
                        {order.customerName} · {order._count.items} бараа
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Үлдэгдэл багатай */}
        <section className="border border-line p-5">
          <h2 className="label flex items-center gap-2 text-graphite">
            <CircleAlert className="size-3.5" />
            Үлдэгдэл дуусаж байна
          </h2>

          {lowStock.length === 0 ? (
            <p className="mt-6 text-sm text-graphite">
              Бүх барааны үлдэгдэл хангалттай байна.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {lowStock.map((variant) => (
                <li
                  key={variant.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/product/${variant.product.slug}`}
                      className="truncate text-sm hover:underline"
                    >
                      {variant.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-graphite">
                      {variant.color} · {variant.size}
                    </p>
                  </div>

                  <span
                    className={
                      variant.stock === 0
                        ? "label bg-sale px-2 py-1 text-bone"
                        : "label text-sale"
                    }
                  >
                    {variant.stock === 0 ? "Дууссан" : `${variant.stock} ширхэг`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Их зарагдсан бараа */}
      <section className="border border-line p-5">
        <h2 className="label text-graphite">Хамгийн их зарагдсан</h2>

        <ul className="mt-4 divide-y divide-line">
          {topProducts.map((product, index) => (
            <li key={product.id} className="flex items-center gap-4 py-3">
              <span className="label w-4 shrink-0 text-graphite tabular-nums">
                {index + 1}
              </span>

              <div className="relative aspect-3/4 w-10 shrink-0 overflow-hidden bg-sand">
                {product.images[0] && (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${product.slug}`}
                  className="truncate text-sm hover:underline"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 text-xs text-graphite tabular-nums">
                  {formatPrice(product.effectivePrice)}
                </p>
              </div>

              <span className="shrink-0 text-sm tabular-nums">
                {product.soldCount} ширхэг
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
