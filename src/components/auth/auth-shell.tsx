import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Нэвтрэх / бүртгүүлэх хуудсуудын нийтлэг хүрээ.
 *
 * Дээд талд буцах сум ба гарчигтай мөр. Эдгээр хуудсанд Navbar
 * байдаггүй тул хэрэглэгч гарах гарцгүй үлдэхээс сэргийлнэ.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Дээд мөр — буцах сум + гарчиг */}
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex h-16 w-full max-w-md items-center gap-4 px-5">
          <Link
            href="/"
            aria-label="Буцах"
            className="-ml-1 p-1 transition-opacity hover:opacity-60"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Link>

          <h1 className="text-base font-medium">
            {title}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-10 sm:py-14">
        {subtitle && (
          <p className="mb-8 text-sm leading-relaxed text-graphite">
            {subtitle}
          </p>
        )}

        {children}

        {footer && <div className="mt-10 text-sm text-graphite">{footer}</div>}
      </main>
    </div>
  );
}
