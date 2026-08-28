import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Нэвтрэх" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // Next.js 16-д searchParams нь Promise — await хийж уншина
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;

  return (
    <AuthShell
      title="Нэвтрэх"
      footer={
        /* "Нууц үгээ мартсан уу?" нь маягтын дотор байгаа тул энд давхардуулахгүй */
        <p className="text-center">
          Бүртгэлгүй юу?{" "}
          <Link href="/register" className="text-ink underline underline-offset-4">
            Бүртгүүлэх
          </Link>
        </p>
      }
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
