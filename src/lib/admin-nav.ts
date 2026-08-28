import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Ticket,
  Users,
} from "lucide-react";

/**
 * Админы цэс.
 * Шинэ хуудас нэмэхэд ЗӨВХӨН энд нэмнэ — sidebar, mobile цэс хоёулаа
 * үүнээс уншдаг тул хоёр газар засах шаардлагагүй.
 */
export const ADMIN_NAV = [
  { label: "Хяналтын самбар", href: "/admin", icon: LayoutDashboard },
  { label: "Бараа", href: "/admin/products", icon: Package },
  { label: "Захиалга", href: "/admin/orders", icon: ShoppingBag },
  { label: "Ангилал", href: "/admin/categories", icon: FolderTree },
  { label: "Купон", href: "/admin/coupons", icon: Ticket },
  { label: "Хэрэглэгч", href: "/admin/customers", icon: Users },
] as const;
