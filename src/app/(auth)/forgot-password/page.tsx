import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Нууц үг сэргээх" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Нууц үг сэргээх"
      /* Тайлбар нь алхам бүрд өөр тул маягтын дотор байрлана */
      footer={
        <p className="text-center">
          Нууц үгээ санасан уу?{" "}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Нэвтрэх
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
