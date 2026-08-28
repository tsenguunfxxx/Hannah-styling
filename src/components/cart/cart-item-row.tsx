"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { QuantityInput } from "@/components/product/quantity-input";
import { formatPrice } from "@/lib/utils";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/constants";
import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/actions/cart.action";
import type { CartLineItem } from "@/lib/queries/cart.query";

/**
 * Сагсны нэг мөр.
 *
 * Тоог өөрчлөхөд дэлгэц ШУУД шинэчлэгдэнэ, сервер хариу ирэхийг хүлээхгүй.
 * Хэрэв сервер татгалзвал хуучин тоо руугаа буцаана.
 */
export function CartItemRow({ item }: { item: CartLineItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(item.quantity);

  const { variant } = item;
  const { product } = variant;
  const image = product.images[0];

  const maxQuantity = Math.min(variant.stock, MAX_QUANTITY_PER_ITEM);

  function handleQuantityChange(next: number) {
    const previous = quantity;
    setQuantity(next); // Шууд харагдана

    startTransition(async () => {
      const result = await updateCartItemAction({ itemId: item.id, quantity: next });

      if (!result.success) {
        setQuantity(previous); // Буцаана
        toast.error(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeCartItemAction({ itemId: item.id });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Сагснаас хаслаа.");
      router.refresh();
    });
  }

  return (
    <li
      className={
        "flex gap-4 border-b border-line py-6 transition-opacity sm:gap-6 " +
        (isPending ? "opacity-60" : "")
      }
    >
      {/* Зураг */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-3/4 w-24 shrink-0 overflow-hidden bg-sand sm:w-28"
      >
        {image && (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        )}
      </Link>

      {/* Мэдээлэл */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label text-graphite">{product.category.name}</p>

            <h3 className="mt-1 truncate text-sm">
              <Link href={`/product/${product.slug}`} className="hover:underline">
                {product.name}
              </Link>
            </h3>

            <p className="mt-1 flex items-center gap-2 text-xs text-graphite">
              <span
                style={{ backgroundColor: variant.colorHex }}
                className="size-3 shrink-0 border border-line"
              />
              {variant.color} · {variant.size}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label={`${product.name} — сагснаас хасах`}
            className="grid size-8 shrink-0 place-items-center text-graphite transition-colors hover:text-sale disabled:opacity-40"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </button>
        </div>

        {/* Сагсанд хийснээс хойш өөрчлөгдсөн зүйлийг анхааруулна */}
        {!product.isActive ? (
          <Warning>Энэ бараа одоогоор зарагдахгүй байна.</Warning>
        ) : variant.stock === 0 ? (
          <Warning>Энэ размер дууссан байна.</Warning>
        ) : item.exceedsStock ? (
          <Warning>Үлдэгдэл {variant.stock} ширхэг болж багассан байна.</Warning>
        ) : null}

        {/* Тоо ба дүн */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <QuantityInput
            value={quantity}
            onChange={handleQuantityChange}
            max={Math.max(maxQuantity, 1)}
            disabled={isPending || variant.stock === 0}
          />

          <div className="text-right">
            <p className="text-sm font-medium tabular-nums">
              {formatPrice(item.unitPrice * quantity)}
            </p>
            {quantity > 1 && (
              <p className="mt-0.5 text-xs text-graphite tabular-nums">
                {formatPrice(item.unitPrice)} × {quantity}
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Улаан анхааруулах мөр */
function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-xs text-sale">
      <TriangleAlert className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}
