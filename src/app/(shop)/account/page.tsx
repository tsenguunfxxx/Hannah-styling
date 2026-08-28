import type { Metadata } from "next";
import Link from "next/link";
import { Heart, LayoutDashboard, Package } from "lucide-react";
import { requireAuth } from "@/lib/auth-guard";
import { ProfileForm } from "@/components/auth/profile-form";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata: Metadata = { title: "Профайл" };

export default async function AccountPage() {
  /*
    Нэвтрээгүй бол /login руу шидэгдэнэ.
    requireAuth нь хэрэглэгчийн хамгийн шинэ мэдээллийг ХАМТ буцаадаг тул
    энд дахин database-аас асуух шаардлагагүй (session-д хуучин нэр байж болно).
  */
  const { user } = await requireAuth();

  return (
    <main className="container-shop py-16">
      <p className="label text-graphite">Миний бүртгэл</p>
      <h1 className="mt-3 font-display text-3xl font-medium uppercase tracking-label">
        Профайл
      </h1>

      <dl className="mt-10 grid max-w-md gap-px border border-line bg-line sm:grid-cols-2">
        <div className="bg-card p-4">
          <dt className="label text-graphite">Имэйл</dt>
          <dd className="mt-1 text-sm">{user.email}</dd>
        </div>
        <div className="bg-card p-4">
          <dt className="label text-graphite">Эрх</dt>
          <dd className="mt-1 text-sm">
            {user.role === "ADMIN" ? "Админ" : "Хэрэглэгч"}
          </dd>
        </div>
      </dl>

      {/* Хэсгүүдийн хооронд шилжих */}
      <nav className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/account/orders"
          className="label inline-flex items-center gap-2 border border-line px-4 py-3 transition-colors hover:border-ink"
        >
          <Package className="size-4" />
          Миний захиалга
        </Link>
        <Link
          href="/wishlist"
          className="label inline-flex items-center gap-2 border border-line px-4 py-3 transition-colors hover:border-ink"
        >
          <Heart className="size-4" />
          Хүслийн жагсаалт
        </Link>

        {/* Зөвхөн админд — хар дэвсгэртэй тул шууд анзаарагдана */}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="label inline-flex items-center gap-2 bg-ink px-4 py-3 text-bone transition-opacity hover:opacity-80"
          >
            <LayoutDashboard className="size-4" />
            Админ хэсэг
          </Link>
        )}
      </nav>

      <div className="mt-12">
        <h2 className="label mb-6 text-graphite">Мэдээлэл засах</h2>
        <ProfileForm
          defaultValues={{ name: user.name ?? "", phone: user.phone ?? "" }}
        />
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <LogoutButton />
      </div>
    </main>
  );
}
