"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";
import { registerAction } from "@/actions/auth.action";
import { LOGIN_REQUIRED } from "@/lib/auth-messages";

/**
 * Бүртгүүлэх маягт.
 *
 * Загвар нь нэвтрэх хуудастай ижил:
 *  - жижиг үсгээр бичсэн энгийн шошго
 *  - цагаан дэвсгэртэй, булан нь бага зэрэг мурий (10px) талбарууд
 *  - утасны өмнө +976 гэсэн тогтмол хайрцаг
 *  - нууц үгийг харах/нуух нүдэн товч
 */
export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Хоёр нууц үгийн талбар тус тусдаа харагдах эсэхээ хадгална
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction(values);

      if (!result || result.success) return;

      /*
        Бүртгэл үүссэн ч автомат нэвтрэлт бүтсэнгүй.
        Алдаа гэж айлгахын оронд нэвтрэх хуудас руу зөөлөн зална —
        хэрэглэгчийн хийх зүйл ганцхан: нэвтрэх.
      */
      if (result.info === LOGIN_REQUIRED) {
        toast.success(result.error);
        router.push("/login");
        return;
      }

      toast.error(result.error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-ink">Нэр</FormLabel>
              <FormControl>
                <Input
                  placeholder="Батбаяр"
                  autoComplete="name"
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
          name="email"
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-baseline justify-between gap-4">
                <FormLabel className="text-sm font-normal text-ink">
                  Утасны дугаар
                </FormLabel>
                <span className="text-sm text-graphite">Заавал биш</span>
              </div>

              <FormControl>
                <div className="flex">
                  {/* Улсын код — зөвхөн харуулна, засах шаардлагагүй */}
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
              </FormControl>
              <FormDescription className="text-xs text-graphite">
                Оруулсан бол энэ дугаараар нэвтрэх боломжтой болно.
              </FormDescription>
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
                    autoComplete="new-password"
                    className="h-12 rounded-[10px] bg-white pr-12 text-base"
                    {...field}
                  />

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
              <FormDescription className="text-xs text-graphite">
                Дор хаяж 8 тэмдэгт, том жижиг үсэг, тоо агуулсан байна.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-ink">
                Нууц үг давтах
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-12 rounded-[10px] bg-white pr-12 text-base"
                    {...field}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Нууц үгийг нуух" : "Нууц үгийг харах"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-graphite transition-colors hover:text-ink"
                  >
                    {showConfirm ? (
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

        <Button
          type="submit"
          disabled={isPending}
          className="h-14 w-full rounded-[10px] text-sm font-medium tracking-normal"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Бүртгүүлэх
        </Button>
      </form>
    </Form>
  );
}
