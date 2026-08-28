"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  forgotPasswordSchema,
  verifyCodeSchema,
  type ForgotPasswordInput,
  type VerifyCodeInput,
} from "@/schemas/auth.schema";
import {
  forgotPasswordAction,
  verifyResetCodeAction,
} from "@/actions/auth.action";

/**
 * Нууц үг сэргээх — 2 АЛХАМТАЙ.
 *
 *   1. Утас эсвэл имэйлээ оруулна  →  6 оронтой код илгээгдэнэ
 *   2. Кодоо оруулна               →  шинэ нууц үгийн хуудас руу шилжинэ
 *
 * Нэвтрэх маягттай адил утас/имэйл гэсэн 2 горимтой.
 */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"phone" | "email">("phone");

  /** Код илгээгдсэн бол энд хаяг/дугаар нь хадгалагдана — 2-р алхам эхэлнэ */
  const [sentTo, setSentTo] = useState<string | null>(null);

  /** Илгээх тохиргоо хийгээгүй үед кодыг дэлгэц дээр харуулна (зөвхөн dev) */
  const [devCode, setDevCode] = useState<string | null>(null);

  const requestForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  const codeForm = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { identifier: "", code: "" },
  });

  const isPhone = mode === "phone";

  /** Горим соливол өмнөх утга үлдэх нь эргэлзээ төрүүлнэ — цэвэрлэнэ */
  function switchMode() {
    setMode((current) => (current === "phone" ? "email" : "phone"));
    requestForm.setValue("identifier", "");
    requestForm.clearErrors("identifier");
  }

  // --- 1-р алхам: код хүсэх ---
  function onRequest(values: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await forgotPasswordAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSentTo(result.identifier);
      setDevCode(result.devCode ?? null);
      codeForm.setValue("identifier", result.identifier);

      toast.success(
        result.channel === "EMAIL"
          ? "Код имэйл рүү илгээгдлээ."
          : "Код утас руу илгээгдлээ.",
      );
    });
  }

  // --- 2-р алхам: кодыг шалгах ---
  function onVerify(values: VerifyCodeInput) {
    startTransition(async () => {
      const result = await verifyResetCodeAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // info талбарт нэг удаагийн түлхүүр ирнэ
      router.push(`/reset-password?token=${result.info}`);
    });
  }

  /** Дахин код авах — 1-р алхам руу буцна */
  function startOver() {
    setSentTo(null);
    setDevCode(null);
    codeForm.reset({ identifier: "", code: "" });
  }

  // ============================================================
  // 2-Р АЛХАМ — код оруулах
  // ============================================================
  if (sentTo) {
    return (
      <Form {...codeForm}>
        <form onSubmit={codeForm.handleSubmit(onVerify)} className="space-y-6">
          <p className="text-sm leading-relaxed text-graphite">
            <span className="text-ink">{sentTo}</span> хаяг руу 6 оронтой код
            илгээлээ. Код 10 минут хүчинтэй.
          </p>

          {devCode && (
            <div className="rounded-[10px] border border-line bg-white p-4 text-sm">
              <p className="mb-1 text-graphite">
                Хөгжүүлэлтийн горим — илгээх тохиргоо хийгээгүй байна
              </p>
              <p className="text-lg tracking-[0.3em] text-ink">{devCode}</p>
            </div>
          )}

          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-normal text-ink">Код</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="h-12 rounded-[10px] bg-white text-center text-lg tracking-[0.4em]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="h-14 w-full rounded-[10px] text-sm font-medium tracking-normal"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Үргэлжлүүлэх
          </Button>

          <button
            type="button"
            onClick={startOver}
            className="w-full text-sm text-graphite underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Өөр хаяг оруулах
          </button>
        </form>
      </Form>
    );
  }

  // ============================================================
  // 1-Р АЛХАМ — утас эсвэл имэйл оруулах
  // ============================================================
  return (
    <Form {...requestForm}>
      <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-6">
        <p className="text-sm leading-relaxed text-graphite">
          Бүртгэлтэй {isPhone ? "утасны дугаараа" : "имэйл хаягаа"} оруулна уу.
          6 оронтой код илгээнэ.
        </p>

        <FormField
          control={requestForm.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              {/* Шошго зүүнд, горим солих холбоос баруунд */}
              <div className="flex items-baseline justify-between gap-4">
                <FormLabel className="text-sm font-normal text-ink">
                  {isPhone ? "Утасны дугаар" : "Имэйл"}
                </FormLabel>

                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-ink underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  {isPhone ? "Имэйл ашиглах" : "Утсаар авах"}
                </button>
              </div>

              <FormControl>
                {isPhone ? (
                  <div className="flex">
                    <span className="grid shrink-0 place-items-center rounded-l-[10px] border border-r-0 border-line bg-white px-4 text-sm text-graphite">
                      +976
                    </span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="99112233"
                      autoComplete="tel-national"
                      className="h-12 rounded-l-none rounded-r-[10px] bg-white text-base"
                      {...field}
                    />
                  </div>
                ) : (
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="h-12 rounded-[10px] bg-white text-base"
                    {...field}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-14 w-full rounded-[10px] text-sm font-medium tracking-normal"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Код авах
        </Button>
      </form>
    </Form>
  );
}
