import { Mail, Phone } from "lucide-react";

import { getCustomers } from "@/lib/queries/admin/customer.query";
import { formatDate, formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Хэрэглэгч" };

/**
 * АДМИН — ХЭРЭГЛЭГЧИД.
 * Зөвхөн ХАРНА. Хэрэглэгчийн мэдээллийг админ засахгүй.
 */
export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-8">
      <div>
        <p className="label text-graphite">
          Нийт {customers.length} бүртгэл
        </p>
        <h1 className="mt-2 font-display text-2xl font-medium uppercase tracking-label">
          Хэрэглэгч
        </h1>
      </div>

      {customers.length === 0 ? (
        <EmptyState title="Хэрэглэгч алга" />
      ) : (
        /* Жижиг дэлгэцэнд хүснэгт багтахгүй тул хажуу тийш гүйнэ */
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-sand/50">
                <Th>Нэр</Th>
                <Th>Холбоо барих</Th>
                <Th>Эрх</Th>
                <Th align="right">Захиалга</Th>
                <Th align="right">Зарцуулсан</Th>
                <Th align="right">Бүртгүүлсэн</Th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    {customer.name ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-graphite">
                      <Mail className="size-3.5 shrink-0" />
                      {customer.email}
                    </span>
                    {customer.phone && (
                      <span className="mt-1 flex items-center gap-2 text-graphite">
                        <Phone className="size-3.5 shrink-0" />
                        {customer.phone}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        customer.role === "ADMIN"
                          ? "label bg-ink px-2 py-1 text-bone"
                          : "label text-graphite"
                      }
                    >
                      {customer.role === "ADMIN" ? "Админ" : "Хэрэглэгч"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums">
                    {customer.orderCount}
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPrice(customer.totalSpent)}
                  </td>

                  <td className="px-4 py-3 text-right text-graphite tabular-nums">
                    {formatDate(customer.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`label px-4 py-3 text-graphite ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

