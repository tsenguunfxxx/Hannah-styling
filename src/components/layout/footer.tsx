import Link from "next/link";

import { SITE, SOCIALS } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import {
  InstagramIcon,
  FacebookIcon,
  TelegramIcon,
} from "@/components/layout/social-icons";

/** Сүлжээний нэрийг харгалзах тэмдэгтэй нь холбоно */
const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  Telegram: TelegramIcon,
} as const;

const FOOTER_LINKS = [
  {
    title: "Дэлгүүр",
    links: [
      { label: "Бүх бараа", href: "/shop" },
      { label: "Шинэ бараа", href: "/shop?sort=newest" },
      { label: "Хямдрал", href: "/shop?sale=true" },
      { label: "Collection", href: "/shop?featured=true" },
    ],
  },
  {
    title: "Тусламж",
    links: [
      { label: "Хүргэлт", href: "/shipping" },
      { label: "Буцаалт", href: "/returns" },
      { label: "Размерын заавар", href: "/size-guide" },
      { label: "Холбоо барих", href: "/contact" },
    ],
  },
  {
    title: "Бидний тухай",
    links: [
      { label: "Бидний тухай", href: "/about" },
      { label: "Нууцлалын бодлого", href: "/privacy" },
      { label: "Үйлчилгээний нөхцөл", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-bone">
      {/* Холбоосууд */}
      <div className="container-shop grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* Хар дэвсгэр дээр лого нь currentColor-оор цайван болно */}
          <Logo className="items-start gap-1.5" />

          <p className="mt-4 max-w-xs text-sm text-bone/60">{SITE.description}</p>

          <div className="mt-6 flex items-center gap-4">
            {SOCIALS.map((social) => {
              const Icon = SOCIAL_ICONS[social.label];

              return (
                <a
                  key={social.label}
                  href={social.href}
                  // Шинэ таб-д нээнэ — хэрэглэгч дэлгүүрээс гарахгүй
                  target="_blank"
                  // Аюулгүй байдал: нээгдсэн хуудас манай таб-ыг удирдаж чадахгүй
                  rel="noopener noreferrer"
                  // Тэмдэг дээр текст байхгүй тул харааны бэрхшээлтэй
                  // хэрэглэгчид зориулж нэрийг нь өгнө
                  aria-label={social.label}
                  className="text-bone/60 transition-colors hover:text-bone"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <p className="label text-bone/50">{group.title}</p>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/70 transition-colors hover:text-bone"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Доод мөр */}
      <div className="border-t border-bone/10">
        <div className="container-shop flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="label text-bone/40">
            © {new Date().getFullYear()} {SITE.name}. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <p className="label text-bone/40">Улаанбаатар, Монгол</p>
        </div>
      </div>
    </footer>
  );
}
