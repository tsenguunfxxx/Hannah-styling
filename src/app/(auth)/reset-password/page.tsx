import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Шинэ нууц үг" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  // Холбоос буруу бол форм харуулах утгагүй
  if (!token) {
    return (
      <AuthShell
        title="Холбоос буруу"
        subtitle="Сэргээх холбоос дутуу эсвэл гэмтсэн байна."
        footer={
          <p className="text-center">
            <Link
              href="/forgot-password"
              className="text-ink underline underline-offset-4"
            >
              Шинэ холбоос авах
            </Link>
          </p>
        }
      >
        <div />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Шинэ нууц үг" subtitle="Шинэ нууц үгээ оруулна уу.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
