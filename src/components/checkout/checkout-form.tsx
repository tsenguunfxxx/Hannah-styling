"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn, formatPrice } from "@/lib/utils";
import { DISTRICTS, PAYMENT_METHODS } from "@/lib/constants";
import { checkoutSchema, type CheckoutInput } from "@/schemas/order.schema";
import { createOrderAction } from "@/actions/order.action";

/**
 * Захиалга баталгаажуулах маягт.
 *
 * Шалгалт нь ХОЁР давхар:
 *   1. Энд (Zod + React Hook Form) — хэрэглэгчид шууд мэдэгдэнэ
 *   2. Сервер дээр ДАХИН — энэ л жинхэнэ хамгаалалт
 */
export function CheckoutForm({
  defaultValues,
  total,
}: {
  defaultValues: Partial<CheckoutInput>;
  total: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      district: "Баянгол",
      addressLine: "",
      note: "",
      paymentMethod: "WIRE",
      ...defaultValues,
    },
  });

  function onSubmit(values: CheckoutInput) {
    startTransition(async () => {
      const result = await createOrderAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Захиалга амжилттай үүслээ.");

      // Амжилтын хуудас руу. replace — буцах товчоор маягт руу эргэж орохгүй
      router.replace(`/order/${result.data.orderNumber}?new=1`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        {/* --- ХҮЛЭЭН АВАГЧ --- */}
        <section>
          <h2 className="label border-b border-line pb-3">Хүлээн авагч</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Нэр</FormLabel>
                  <FormControl>
                    <Input placeholder="Батбаяр" autoComplete="name" {...field} />
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
                  <FormLabel className="label text-graphite">Утас</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="99119911"
                      autoComplete="tel"
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
                <FormItem className="sm:col-span-2">
                  <FormLabel className="label text-graphite">Имэйл</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Заавал биш. Бичвэл захиалгын мэдээллийг илгээнэ.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* --- ХҮРГЭЛТИЙН ХАЯГ --- */}
        <section>
          <h2 className="label border-b border-line pb-3">Хүргэлтийн хаяг</h2>

          <div className="mt-6 space-y-5">
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Дүүрэг</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        className="h-11 w-full appearance-none border border-line bg-transparent px-3 pr-9 text-sm outline-none focus-visible:border-ink"
                      >
                        {DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-graphite" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">
                    Хороо, байр, тоот
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="5-р хороо, 32-р байр, 14 тоот"
                      autoComplete="street-address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">
                    Нэмэлт тэмдэглэл
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Хүргэлтийн цаг, орцны код гэх мэт"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* --- ТӨЛБӨР --- */}
        <section>
          <h2 className="label border-b border-line pb-3">Төлбөрийн арга</h2>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="mt-6">
                <div className="grid gap-3" role="radiogroup">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === method.value}
                      onClick={() => field.onChange(method.value)}
                      className={cn(
                        "flex items-center gap-3 border px-4 py-4 text-left transition-colors",
                        field.value === method.value
                          ? "border-ink"
                          : "border-line hover:border-graphite",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-full border",
                          field.value === method.value
                            ? "border-ink"
                            : "border-line",
                        )}
                      >
                        {field.value === method.value && (
                          <span className="size-2 rounded-full bg-ink" />
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm">{method.label}</span>
                        <span className="block text-xs text-graphite">
                          {method.hint}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Button
          type="submit"
          disabled={isPending}
          className="label h-14 w-full"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {formatPrice(total)} — Захиалга баталгаажуулах
        </Button>
      </form>
    </Form>
  );
}
