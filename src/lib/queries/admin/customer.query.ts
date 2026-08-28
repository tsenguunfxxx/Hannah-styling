import { prisma } from "@/lib/prisma";

/**
 * Админ — хэрэглэгчийн жагсаалт.
 *
 * АЮУЛГҮЙ БАЙДАЛ: `password` талбарыг ХЭЗЭЭ Ч select хийхгүй.
 * Prisma-д "бүгдийг ав" гэвэл hash хүртэл frontend рүү явна.
 * Тиймээс хэрэгтэй талбаруудыг нэр заан жагсаана.
 */
export async function getCustomers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      orders: {
        // Цуцлагдсаныг зарцуулалтад тооцохгүй
        where: { status: { not: "CANCELLED" } },
        select: { total: true },
      },
      _count: { select: { orders: true } },
    },
  });

  return users.map((user) => ({
    ...user,
    totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
    orderCount: user._count.orders,
  }));
}

export type CustomerRow = Awaited<ReturnType<typeof getCustomers>>[number];
