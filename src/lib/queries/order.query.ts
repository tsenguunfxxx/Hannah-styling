import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ownsGuestOrder } from "@/lib/guest-orders";

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
 *
 * ГУРВАН хүн үзэх эрхтэй:
 *   1. Захиалсан хэрэглэгч өөрөө
 *   2. Админ
 *   3. Тэр захиалгыг үүсгэсэн ЗОЧИН — тамгалсан cookie-гоор нь таньж
 */
export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { orderBy: { id: "asc" } },
      payment: true,
      coupon: { select: { code: true } },
    },
  });

  if (!order) return null;

  return (await canViewOrder(order.userId, orderNumber)) ? order : null;
}

/**
 * Энэ хүсэлт тухайн захиалгыг үзэх эрхтэй эсэх.
 *
 * Захиалгыг үзэх, төлөх, цуцлах гурван зам бүгд ЭНЭ нэг дүрмийг
 * дагана — ингэснээр нэг газарт нь эрх нээгээд нөгөөд нь мартах
 * боломжгүй.
 */
export async function canViewOrder(
  orderUserId: string | null,
  orderNumber: string,
): Promise<boolean> {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "ADMIN") return true;
    if (orderUserId && orderUserId === session.user.id) return true;
  }

  /*
    Бүртгэлгүй захиалга (`userId` нь null) бол зөвхөн түүнийг
    үүсгэсэн хөтөч нээнэ. Cookie нь серверийн нууц түлхүүрээр
    тамгалагдсан тул хуурамчаар үйлдэх боломжгүй.

    Бүртгэлтэй захиалгад cookie ажиллахгүй — эзэн нь тодорхой байна.
  */
  if (orderUserId === null) return ownsGuestOrder(orderNumber);

  return false;
}

export type OrderListItem = Awaited<ReturnType<typeof getMyOrders>>[number];
export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderByNumber>>
>;
