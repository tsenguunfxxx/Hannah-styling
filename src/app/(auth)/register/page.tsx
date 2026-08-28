import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Бүртгүүлэх" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Бүртгүүлэх"
      footer={
        <p className="text-center">
          Бүртгэлтэй юу?{" "}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Нэвтрэх
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
