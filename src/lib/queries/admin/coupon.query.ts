import { prisma } from "@/lib/prisma";

/** Админы купоны жагсаалт — шинэ нь эхэндээ */
export async function getAdminCoupons() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      minOrder: true,
      maxUses: true,
      usedCount: true,
      startsAt: true,
      expiresAt: true,
      isActive: true,
      _count: { select: { orders: true } },
    },
  });

  const now = new Date();

  return coupons.map((coupon) => ({
    ...coupon,
    /** Яг одоо хэрэглэж болох эсэх — жагсаалтад тодоор харуулна */
    usable:
      coupon.isActive &&
      (!coupon.startsAt || coupon.startsAt <= now) &&
      (!coupon.expiresAt || coupon.expiresAt >= now) &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses),
  }));
}

export type AdminCoupon = Awaited<ReturnType<typeof getAdminCoupons>>[number];
