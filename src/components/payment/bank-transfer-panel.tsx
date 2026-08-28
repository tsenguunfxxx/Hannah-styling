"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BANK_ACCOUNTS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { submitBankTransferAction } from "@/actions/payment.action";

/**
 * Банкны шилжүүлгээр төлөх.
 *
 * Гүйлгээний утганд ЗАХИАЛГЫН ДУГААР бичих нь хамгийн чухал —
 * үгүй бол админ хэний мөнгө болохыг таних аргагүй.
 */
export function BankTransferPanel({
  orderNumber,
  amount,
  savedTransactionId,
}: {
  orderNumber: string;
  amount: number;
  savedTransactionId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [transactionId, setTransactionId] = useState(savedTransactionId ?? "");
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Хуулж чадсангүй. Гараар тэмдэглэнэ үү.");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await submitBankTransferAction(orderNumber, {
        transactionId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Хүлээн авлаа. Бид шалгаад баталгаажуулна.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Данснууд */}
      <div className="space-y-3">
        {BANK_ACCOUNTS.map((account) => (
          <div key={account.number} className="border border-line p-4">
            <p className="label text-graphite">{account.bank}</p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="font-display text-lg tracking-label tabular-nums">
                {account.number}
              </p>

              <CopyButton
                label={`${account.bank} дансыг хуулах`}
                active={copied === account.number}
                onClick={() => copy(account.number.replace(/\s/g, ""), account.number)}
              />
            </div>

            <p className="mt-1 text-xs text-graphite">{account.holder}</p>
          </div>
        ))}
      </div>

      {/* Шилжүүлэх мэдээлэл */}
      <dl className="border border-ink p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-graphite">Дүн</dt>
          <dd className="font-display text-lg tabular-nums">
            {formatPrice(amount)}
          </dd>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <dt className="text-graphite">Гүйлгээний утга</dt>
          <dd className="flex items-center gap-2">
            <span className="font-display tracking-label">{orderNumber}</span>
            <CopyButton
              label="Гүйлгээний утгыг хуулах"
              active={copied === orderNumber}
              onClick={() => copy(orderNumber, orderNumber)}
            />
          </dd>
        </div>
      </dl>

      <p className="text-xs leading-relaxed text-graphite">
        Гүйлгээний утганд заавал <strong>{orderNumber}</strong> гэж бичнэ үү.
        Үгүй бол таны төлбөрийг таних боломжгүй.
      </p>

      {/* Гүйлгээний дугаар мэдэгдэх */}
      <form onSubmit={handleSubmit} className="border-t border-line pt-6">
        <label htmlFor="transaction-id" className="label text-graphite">
          Шилжүүлсэн бол гүйлгээний дугаараа бичнэ үү
        </label>

        <div className="mt-3 flex gap-2">
          <Input
            id="transaction-id"
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
            placeholder="Жишээ: 202608271234"
          />

          <Button
            type="submit"
            disabled={isPending || transactionId.trim().length < 4}
            className="label h-10 shrink-0"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            Илгээх
          </Button>
        </div>

        {savedTransactionId && (
          <p className="mt-3 text-xs text-graphite">
            Хүлээн авсан: {savedTransactionId}. Бид дансаа шалгаад
            баталгаажуулна.
          </p>
        )}
      </form>
    </div>
  );
}

function CopyButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center border border-line text-graphite transition-colors hover:border-ink hover:text-ink"
    >
      {active ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}
