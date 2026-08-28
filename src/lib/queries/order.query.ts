import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Захиалга УНШИХ асуулгууд.
 *
 * АЮУЛГҮЙ БАЙДАЛ: захиалгыг зөвхөн эзэн нь (эсвэл админ) харна.
 * Тиймээс энд бүх асуулга session-ийг өөрөө шалгана — дуудаж
 * байгаа хуудас мартсан ч өгөгдөл задрахгүй.
 */

/** Захиалгын жагсаалтад хэрэгтэй талбарууд */
const listSelect = {
  id: true,
  orderNumber: true,
  status: true,
  total: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      productName: true,
      image: true,
      size: true,
      color: true,
      quantity: true,
    },
  },
  payment: { select: { method: true, status: true } },
} as const;

/** Нэвтэрсэн хэрэглэгчийн БҮХ захиалга — шинэ нь эхэндээ */
export async function getMyOrders() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: listSelect,
  });
}

/**
 * Нэг захиалгын дэлгэрэнгүй.
 *
 * Өөрийнх биш бол null буцаана — "байхгүй" гэсэнтэй ижил.
 * Ингэснээр хэн нэгэн дугаар таамаглаад бусдын захиалгыг үзэх боломжгүй.
 */
export async function getOrderByNumber(orderNumber: string) {
  const session = await auth();
  if (!session?.user) return null;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { orderBy: { id: "asc" } },
      payment: true,
      coupon: { select: { code: true } },
    },
  });

  if (!order) return null;

  // Админ бүх захиалгыг харна, хэрэглэгч зөвхөн өөрийнхөө
  const isOwner = order.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) return null;

  return order;
}

export type OrderListItem = Awaited<ReturnType<typeof getMyOrders>>[number];
export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderByNumber>>
>;
