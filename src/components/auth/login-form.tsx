"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { loginAction } from "@/actions/auth.action";

/**
 * Нэвтрэх маягт.
 *
 * ЗӨВХӨН ИМЭЙЛЭЭР нэвтэрнэ.
 *
 * Өмнө нь "утас / имэйл" гэсэн хоёр горимтой байсныг хассан.
 * Бүртгэлд имэйл ЗААВАЛ шаарддаг (утас нь сонголт) тул хүн бүр
 * имэйлтэй — харин утасгүй хүн утсаар нэвтэрч чаддаггүй байлаа.
 * Нэг л зам үлдээх нь хэрэглэгчид ойлгомжтой, кодод ч цэвэрхэн.
 *
 * Талбарын нэр `identifier` хэвээр — Auth.js провайдер болон
 * бүртгэлийн дараах автомат нэвтрэлт үүнийг ашигладаг.
 */
export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await loginAction(values, callbackUrl);

      // Амжилттай бол server талаас redirect хийгдэнэ — энд зөвхөн алдааг барина
      if (result && !result.success) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-ink">Имэйл</FormLabel>

              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="h-12 rounded-[10px] bg-white text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-ink">Нууц үг</FormLabel>

              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-12 rounded-[10px] bg-white pr-12 text-base"
                    {...field}
                  />

                  {/* Нууц үгээ шалгах — буруу бичсэн эсэхээ хараад залруулна */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Нууц үгийг нуух" : "Нууц үгийг харах"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-graphite transition-colors hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="size-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="flex flex-wrap items-center justify-end gap-x-2 text-sm text-graphite">
          Нууц үгээ мартсан уу?
          <Link
            href="/forgot-password"
            className="text-ink underline underline-offset-4"
          >
            Сэргээх
          </Link>
        </p>

        <Button
          type="submit"
          disabled={isPending}
          className="h-14 w-full rounded-[10px] text-sm font-medium tracking-normal"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Нэвтрэх
        </Button>
      </form>
    </Form>
  );
}
