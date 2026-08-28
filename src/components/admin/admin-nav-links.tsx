"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/admin-nav";

/**
 * Админы цэсний холбоосууд.
 *
 * Client Component байх ганц шалтгаан нь usePathname —
 * одоо ямар хуудсан дээр байгааг мэдэж идэвхтэйг нь тодруулна.
 */
export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;

        // "/admin" нь бүх дэд хуудасны угтвар тул тэр ганцад нь яг тэнцүүг шалгана
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "label flex items-center gap-3 px-3 py-2.5 transition-colors",
              isActive
                ? "bg-ink text-bone"
                : "text-graphite hover:bg-sand hover:text-ink",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
