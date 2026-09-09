"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, CreditCard, Loader2 } from "lucide-react";

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
import { formatPrice } from "@/lib/utils";
import { COUNTRYSIDE, DISTRICTS, PAYMENT_METHODS } from "@/lib/constants";
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
      district: "Баянгол",
      addressLine: "",
      note: "",
      paymentMethod: "WIRE",
      ...defaultValues,
    },
  });

  /*
    Сонгосон дүүргийг хянана — утга солигдох бүрд талбарууд шууд
    өөрчлөгдөнө.

    `form.watch` биш `useWatch` ашигласан шалтгаан: эхнийх нь бүхэл
    маягтыг дахин зурдаг бөгөөд React Compiler түүнийг оновчилж
    чаддаггүй. `useWatch` нь ЗӨВХӨН энэ нэг талбарыг сонсоно.
  */
  const district = useWatch({ control: form.control, name: "district" });
  const isCountryside = district === COUNTRYSIDE;

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
                  <FormLabel className="label text-graphite">
                    Дүүрэг / Орон нутаг
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);

                          /*
                            Орон нутаг сонгоход "хороо, байр, тоот"
                            талбар алга болно. Түүнд бичсэн утга
                            үлдвэл харагдахгүй атлаа хамт илгээгдэнэ —
                            тиймээс цэвэрлэнэ.
                          */
                          if (event.target.value === COUNTRYSIDE) {
                            form.setValue("addressLine", "");
                            form.clearErrors("addressLine");
                          }
                        }}
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

            {/* Улаанбаатарт л утгатай — орон нутагт хороо, байр гэж байхгүй */}
            {!isCountryside && (
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
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">
                    {isCountryside ? "Дэлгэрэнгүй мэдээлэл" : "Нэмэлт тэмдэглэл"}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={isCountryside ? 4 : 3}
                      placeholder={
                        isCountryside
                          ? "Аймаг, сум, хүлээж авах цэг, холбоо барих хүн"
                          : "Хүргэлтийн цаг, орцны код гэх мэт"
                      }
                      {...field}
                    />
                  </FormControl>
                  {isCountryside && (
                    <FormDescription>
                      Хүргэгч танд хүрэхэд хангалттай мэдээллийг бичнэ үү.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* --- ТӨЛБӨР --- */}
        <section>
          <h2 className="label border-b border-line pb-3">Төлбөр</h2>

          {/*
            Арга нэг л байгаа тул СОНГОХ зүйл алга — radio харуулах
            нь хуурамч сонголт болно. Оронд нь юу болохыг товч хэлнэ.

            `paymentMethod` талбар нь маягтын анхдагч утгаараа (WIRE)
            дамжсаар байна — зөвхөн харагдац өөрчлөгдсөн.
          */}
          <div className="mt-6 flex items-start gap-3 border border-line p-4">
            <CreditCard className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="text-sm">{PAYMENT_METHODS[0].label}</p>
              <p className="mt-1 text-xs leading-relaxed text-graphite">
                Захиалга баталгаажсаны дараа төлбөрийн хуудас нээгдэнэ.
                Банкны апп, цахим хэтэвч, QR-аас сонгоно.
              </p>
            </div>
          </div>
        </section>

        {/*
          Товчны бичиг УРТ (үйлдэл + дүн), `label` нь үсэг хооронд
          өргөн зай тавьдаг тул нарийн дэлгэц дээр нэг мөрөнд
          багтахгүй байв. Багтаагүй бичиг товчноос халин гараад
          БҮХ хуудсыг хажуу тийш сунгаж байсан.

          Шийдэл:
            whitespace-normal + flex-wrap — багтахгүй бол хоёр мөр
              болж БУУНА, хуудас сунахгүй
            хэсэг тус бүрд whitespace-nowrap — үг дундуураа тасрахгүй
            h-auto min-h-14 — хоёр мөр болоход товч өндөрсөнө
        */}
        <Button
          type="submit"
          disabled={isPending}
          className="label h-auto min-h-14 w-full flex-wrap gap-x-2.5 gap-y-1 px-5 py-4 whitespace-normal"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          <span className="whitespace-nowrap">Захиалга баталгаажуулах</span>
          <span className="whitespace-nowrap tabular-nums">
            {formatPrice(total)}
          </span>
        </Button>
      </form>
    </Form>
  );
}
