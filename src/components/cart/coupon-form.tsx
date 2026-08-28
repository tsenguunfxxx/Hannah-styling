"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import {
  applyCouponAction,
  removeCouponAction,
} from "@/actions/coupon.action";

/** getCart()-аас ирэх купоны төлөв */
export type AppliedCoupon =
  | { code: string; couponId: string; discount: number }
  | { code: string; couponId: null; discount: 0; error: string }
  | null;

/**
 * Купон оруулах хэсэг.
 *
 * Гурван төлөвтэй:
 *   1. Купонгүй   → код оруулах талбар
 *   2. Хүчинтэй   → код, хямдрал, цуцлах товч
 *   3. Хүчингүй   → шалтгааныг харуулаад цуцлах санал болгоно
 */
export function CouponForm({ applied }: { applied: AppliedCoupon }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");

  function handleApply(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await applyCouponAction(code);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`${formatPrice(result.data.discount)} хямдрал нэмэгдлээ.`);
      setCode("");
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeCouponAction();
      toast.success("Купон цуцлагдлаа.");
      router.refresh();
    });
  }

  // Хүчингүй болсон купон
  if (applied && applied.couponId === null) {
    return (
      <div className="border border-sale p-4">
        <p className="flex items-start gap-2 text-xs text-sale">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <strong>{applied.code}</strong> — {applied.error}
          </span>
        </p>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="label mt-3 text-graphite underline underline-offset-4 hover:text-ink disabled:opacity-40"
        >
          Купоныг цуцлах
        </button>
      </div>
    );
  }

  // Хүчинтэй купон
  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 border border-ink p-4">
        <div className="flex min-w-0 items-center gap-2">
          <Tag className="size-3.5 shrink-0" />
          <div className="min-w-0">
            <p className="label truncate">{applied.code}</p>
            <p className="text-xs text-graphite tabular-nums">
              −{formatPrice(applied.discount)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          aria-label="Купоныг цуцлах"
          className="grid size-8 shrink-0 place-items-center text-graphite transition-colors hover:text-sale disabled:opacity-40"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <Input
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="Купоны код"
        aria-label="Купоны код"
        // Код үргэлж том үсгээр харагдана
        className="uppercase"
      />

      <Button
        type="submit"
        variant="outline"
        disabled={isPending || code.trim().length === 0}
        className="label h-10 shrink-0"
      >
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Хэрэглэх
      </Button>
    </form>
  );
}
