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
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { resetPasswordAction } from "@/actions/auth.action";

/**
 * Шинэ нууц үг тохируулах.
 * Загвар нь нэвтрэх/бүртгүүлэх хуудастай ижил.
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  function onSubmit(values: ResetPasswordInput) {
    startTransition(async () => {
      const result = await resetPasswordAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Нууц үг амжилттай солигдлоо.");
      router.push("/login");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-ink">
                Шинэ нууц үг
              </FormLabel>

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
          Нууц үг солих
        </Button>
      </form>
    </Form>
  );
}
