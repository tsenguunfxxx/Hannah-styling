"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, Loader2, Plus, Power, SquarePen, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { describeCoupon } from "@/lib/coupon";
import { formatPrice } from "@/lib/utils";
import { couponFormSchema, type CouponFormInput } from "@/schemas/coupon.schema";
import {
  createCouponAction,
  deleteCouponAction,
  toggleCouponAction,
  updateCouponAction,
} from "@/actions/admin/coupon.action";
import type { AdminCoupon } from "@/lib/queries/admin/coupon.query";

/** Купон удирдах — жагсаалт ба маягт */
export function CouponManager({ coupons }: { coupons: AdminCoupon[] }) {
  const [editing, setEditing] = useState<AdminCoupon | "new" | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="label h-11" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Шинэ купон
        </Button>
      </div>

      {coupons.length === 0 ? (
        <p className="border border-dashed border-line px-4 py-12 text-center text-sm text-graphite">
          Купон алга. Эхнийхээ үүсгэнэ үү.
        </p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-sand/50">
                <Th>Код</Th>
                <Th>Хямдрал</Th>
                <Th>Нөхцөл</Th>
                <Th>Хугацаа</Th>
                <Th align="right">Хэрэглэсэн</Th>
                <Th>Төлөв</Th>
                <Th align="right">Үйлдэл</Th>
              </tr>
            </thead>

            <tbody>
              {coupons.map((coupon) => (
                <CouponRow
                  key={coupon.id}
                  coupon={coupon}
                  onEdit={() => setEditing(coupon)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CouponFormDialog
        key={editing === "new" ? "new" : (editing?.id ?? "closed")}
        editing={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function CouponRow({
  coupon,
  onEdit,
}: {
  coupon: AdminCoupon;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ success: boolean; error?: string }>, ok: string) {
    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        toast.error(result.error ?? "Алдаа гарлаа.");
        return;
      }

      toast.success(ok);
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 font-display tracking-label">{coupon.code}</td>

      <td className="px-4 py-3">{describeCoupon(coupon)}</td>

      <td className="px-4 py-3 text-graphite">
        {coupon.minOrder ? `${formatPrice(coupon.minOrder)}-аас дээш` : "—"}
      </td>

      <td className="px-4 py-3 text-graphite tabular-nums">
        {formatRange(coupon.startsAt, coupon.expiresAt)}
      </td>

      <td className="px-4 py-3 text-right tabular-nums">
        {coupon.usedCount}
        {coupon.maxUses !== null && ` / ${coupon.maxUses}`}
      </td>

      <td className="px-4 py-3">
        <span
          className={
            coupon.usable
              ? "label border border-ink px-2 py-1"
              : "label border border-line px-2 py-1 text-graphite"
          }
        >
          {coupon.usable ? "Хүчинтэй" : coupon.isActive ? "Хугацаа" : "Унтраасан"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <IconButton label="Засах" onClick={onEdit} disabled={isPending}>
            <SquarePen className="size-3.5" />
          </IconButton>

          <IconButton
            label={coupon.isActive ? "Унтраах" : "Асаах"}
            disabled={isPending}
            onClick={() =>
              run(
                () => toggleCouponAction(coupon.id),
                coupon.isActive ? "Купон унтарлаа." : "Купон идэвхжлээ.",
              )
            }
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Power className="size-3.5" />
            )}
          </IconButton>

          <IconButton
            label="Устгах"
            disabled={isPending}
            danger
            onClick={() =>
              run(() => deleteCouponAction(coupon.id), "Купон устлаа.")
            }
          >
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}

function CouponFormDialog({
  editing,
  onClose,
}: {
  editing: AdminCoupon | "new" | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const coupon = editing === "new" || editing === null ? null : editing;

  const form = useForm<CouponFormInput>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      type: coupon?.type ?? "PERCENT",
      value: coupon?.value ?? 10,
      minOrder: coupon?.minOrder ?? null,
      maxUses: coupon?.maxUses ?? null,
      startsAt: toInputDate(coupon?.startsAt),
      expiresAt: toInputDate(coupon?.expiresAt),
      isActive: coupon?.isActive ?? true,
    },
  });

  function onSubmit(values: CouponFormInput) {
    startTransition(async () => {
      const result = coupon
        ? await updateCouponAction(coupon.id, values)
        : await createCouponAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(coupon ? "Купон хадгалагдлаа." : "Купон нэмэгдлээ.");
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-label">
            {coupon ? "Купон засах" : "Шинэ купон"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label text-graphite">Код</FormLabel>
                    <FormControl>
                      <Input placeholder="WELCOME10" className="uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label text-graphite">Төрөл</FormLabel>
                    <FormControl>
                      <SelectBox {...field}>
                        <option value="PERCENT">Хувиар (%)</option>
                        <option value="FIXED">Тогтмол дүн (₮)</option>
                      </SelectBox>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label text-graphite">Утга</FormLabel>
                    <FormControl>
                      <NumberInput field={field} min={1} />
                    </FormControl>
                    <FormDescription>
                      Хувиар бол 10 = 10%, тогтмол бол 20000 = 20,000₮
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label text-graphite">
                      Доод дүн (₮)
                    </FormLabel>
                    <FormControl>
                      <NumberInput field={field} min={0} nullable />
                    </FormControl>
                    <FormDescription>Хоосон бол хязгааргүй</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label text-graphite">
                      Хэрэглэх хязгаар
                    </FormLabel>
                    <FormControl>
                      <NumberInput field={field} min={1} nullable />
                    </FormControl>
                    <FormDescription>Хоосон бол хязгааргүй</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pb-3 sm:self-end">
                    <input
                      id="coupon-active"
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="size-4 accent-ink"
                    />
                    <label
                      htmlFor="coupon-active"
                      className="label cursor-pointer text-graphite"
                    >
                      Идэвхтэй
                    </label>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label text-graphite">
                      Эхлэх огноо
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label text-graphite">
                      Дуусах огноо
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="label h-11">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Хадгалах
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="label h-11"
              >
                Болих
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Жижиг туслах компонентууд ---------- */

function SelectBox({
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        {...props}
        className="h-11 w-full appearance-none border border-line bg-transparent px-3 pr-9 text-sm outline-none focus-visible:border-ink"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-graphite" />
    </div>
  );
}

/**
 * Тоон талбар.
 * type="number" үргэлж ТЕКСТ буцаадаг тул Number() рүү хөрвүүлнэ.
 */
function NumberInput({
  field,
  min,
  nullable = false,
}: {
  field: {
    name: string;
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    onBlur: () => void;
  };
  min: number;
  nullable?: boolean;
}) {
  return (
    <Input
      type="number"
      min={min}
      name={field.name}
      onBlur={field.onBlur}
      value={field.value ?? ""}
      placeholder={nullable ? "Хязгааргүй" : undefined}
      onChange={(event) => {
        const raw = event.target.value;
        if (raw === "") {
          field.onChange(nullable ? null : 0);
          return;
        }
        field.onChange(Number(raw));
      }}
    />
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={
        "grid size-8 place-items-center border border-line text-graphite transition-colors disabled:opacity-40 " +
        (danger
          ? "hover:border-sale hover:text-sale"
          : "hover:border-ink hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`label px-4 py-3 text-graphite ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

/** Date → "2026-09-01" (input type="date"-д тохирсон хэлбэр) */
function toInputDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

/** "09/01 — 09/30" эсвэл "Хязгааргүй" */
function formatRange(start: Date | null, end: Date | null): string {
  if (!start && !end) return "Хязгааргүй";

  const format = (date: Date) =>
    new Intl.DateTimeFormat("mn-MN", { month: "2-digit", day: "2-digit" }).format(
      new Date(date),
    );

  if (start && end) return `${format(start)} — ${format(end)}`;
  if (start) return `${format(start)}-ээс`;
  return `${format(end!)} хүртэл`;
}
