"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteProductAction,
  toggleProductActiveAction,
} from "@/actions/admin/product.action";

/**
 * Барааны мөрийн үйлдлүүд: засах / нуух / устгах.
 *
 * Устгах нь буцаах боломжгүй тул баталгаажуулах цонхтой.
 * Нуух нь аюулгүй сонголт — өгөгдөл бүрэн үлдэнэ.
 */
export function ProductRowActions({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Base UI-ийн AlertDialogAction цонхыг өөрөө хаадаггүй
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleProductActiveAction(id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        result.data.isActive
          ? "Бараа дэлгүүрт харагдана."
          : "Бараа дэлгүүрээс нуугдлаа.",
      );
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProductAction(id);
      setConfirmOpen(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Бараа устлаа.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <IconLink href={`/admin/products/${id}/edit`} label="Засах">
        <SquarePen className="size-3.5" />
      </IconLink>

      <IconButton
        label={isActive ? "Дэлгүүрээс нуух" : "Дэлгүүрт харуулах"}
        onClick={handleToggle}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : isActive ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
      </IconButton>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger
          render={
            <button
              type="button"
              aria-label="Устгах"
              title="Устгах"
              disabled={isPending}
              className="grid size-8 place-items-center border border-line text-graphite transition-colors hover:border-sale hover:text-sale disabled:opacity-40"
            />
          }
        >
          <Trash2 className="size-3.5" />
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Барааг устгах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              &laquo;{name}&raquo; болон түүний зураг, размер, сэтгэгдэл бүрмөсөн
              устана. Хуучин захиалгууд хэвээр үлдэнэ. Устгахын оронд
              &laquo;нуух&raquo; сонголтыг ашиглаж болно.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Тийм, устга
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center border border-line text-graphite transition-colors hover:border-ink hover:text-ink"
    >
      {children}
    </Link>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center border border-line text-graphite transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
