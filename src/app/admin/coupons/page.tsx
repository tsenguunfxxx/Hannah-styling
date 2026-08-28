import { getAdminCoupons } from "@/lib/queries/admin/coupon.query";
import { CouponManager } from "@/components/admin/coupon-manager";

export const metadata = { title: "Купон" };

/**
 * АДМИН — КУПОН.
 * Хэрэглэгч сагсандаа код оруулахад энд үүсгэсэн купонууд ажиллана.
 */
export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  const active = coupons.filter((c) => c.usable).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="label text-graphite">
          {coupons.length} купон · {active} хүчинтэй
        </p>
        <h1 className="mt-2 font-display text-2xl font-medium uppercase tracking-label">
          Купон
        </h1>
      </div>

      <CouponManager coupons={coupons} />
    </div>
  );
}
