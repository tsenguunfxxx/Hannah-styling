"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { QuantityInput } from "@/components/product/quantity-input";
import { WishlistButton } from "@/components/product/wishlist-button";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { addToCartAction } from "@/actions/cart.action";
import { cn } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD, MAX_QUANTITY_PER_ITEM } from "@/lib/constants";
import {
  findVariant,
  getColorOptions,
  getSizeOptions,
  getTotalStock,
  isSizeAvailable,
  type VariantLike,
} from "@/lib/variant-utils";

/**
 * ӨНГӨ + РАЗМЕР сонгох, сагсанд нэмэх хэсэг.
 *
 * Энэ бол дэлгэрэнгүй хуудасны цорын ганц Client Component.
 * Бусад хэсэг нь Server дээр үлдэнэ — ингэснээр browser руу явах
 * JavaScript хамгийн бага байна.
 */
export function VariantPicker({
  productId,
  basePrice,
  discountPrice,
  variants,
  inWishlist,
  afterPrice,
}: {
  productId: string;
  basePrice: number;
  discountPrice: number | null;
  variants: VariantLike[];
  inWishlist: boolean;
  /**
   * Үнэ болон өнгөний ХООРОНД байрлах агуулга.
   *
   * Server дээр бэлдэгдсэн JSX-ээр дамжина — ингэснээр доторх
   * өгөгдөл (сэтгэгдэл г.м) browser руу нэмэлт JavaScript авчрахгүй.
   */
  afterPrice?: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const colors = useMemo(() => getColorOptions(variants), [variants]);
  const sizes = useMemo(() => getSizeOptions(variants), [variants]);

  // Эхлээд үлдэгдэлтэй эхний өнгийг сонгож өгнө — хэрэглэгчид нэг алхам хэмнэнэ
  const [color, setColor] = useState<string | null>(
    () => colors.find((c) => c.stock > 0)?.color ?? colors[0]?.color ?? null,
  );
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  /*
    "Размераа сонгоно уу" гэдгийг ЗӨВХӨН toast-аар мэдэгддэг байсан.
    Гар утсан дээр тэр мэдэгдэл дэлгэцийн доод буланд, товч дарж
    буй хурууны доор гарч ирдэг тул үзэгдэлгүй өнгөрдөг байв.

    Одоо размерын товчнуудын ЯГ доор улаанаар бичигдэж, тэр хэсэг
    рүү дэлгэц автоматаар гүйнэ.
  */
  const [sizeMissing, setSizeMissing] = useState(false);
  const sizeRef = useRef<HTMLFieldSetElement>(null);

  /*
    Сагсанд нэмэгдсэний ДАРААХ хоромхон баталгаа.

    Өмнө нь зөвхөн toast гарч байсан — тэр нь дэлгэцийн буланд,
    дарсан товчноос хол байрладаг. Хүн дарсан товчоо хардаг тул
    баталгааг ЯГ ТЭНД харуулах нь илүү ойлгомжтой.

    1.8 секундын дараа товч хэвэндээ ордог: хэрэглэгч дахин нэмэх
    боломжтой хэвээр байгааг харуулах ёстой.
  */
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Хуудсаас гарахад дуусаагүй таймер үлдээхгүй
  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const selected = findVariant(variants, color, size);
  const totalStock = getTotalStock(variants);
  const isSoldOut = totalStock === 0;

  // Variant-д тусдаа үнэ тавьсан бол түүнийг харуулна (schema: price Int?)
  const hasOwnPrice = selected?.price != null;
  const shownBase = hasOwnPrice ? selected.price! : basePrice;
  const shownDiscount = hasOwnPrice ? null : discountPrice;

  // Хэрэглэгч хэдийг авч чадах вэ
  const maxQuantity = Math.min(selected?.stock ?? 1, MAX_QUANTITY_PER_ITEM);

  /*
    Товчны дүрсийн байдал. `justAdded` нь `isPending`-ээс ТЭРГҮҮЛНЭ:
    сервер хариу өгсний дараа ч `router.refresh()` дуустал `isPending`
    үнэн хэвээр үлддэг тул эсрэгээр бичихэд "эргэлдэх дугуй + Сагсанд
    НЭМЭГДЛЭЭ" гэсэн зөрчилтэй хослол харагдана.
  */
  const iconState = justAdded ? "added" : isPending ? "pending" : "idle";

  function handleColorChange(next: string) {
    setColor(next);
    setQuantity(1);
    setJustAdded(false);

    // Шинэ өнгөнд сонгосон размер байхгүй бол размерыг цэвэрлэнэ
    if (size && !isSizeAvailable(variants, next, size)) {
      setSize(null);
    }
  }

  function handleSizeChange(next: string) {
    setSize(next);
    setSizeMissing(false);

    // Өөр размер сонгосон тул өмнөх баталгаа хуучирсан
    setJustAdded(false);

    // Тухайн размерын үлдэгдлээс хэтэрсэн бол тоог буулгана
    const variant = findVariant(variants, color, next);
    if (variant) setQuantity((q) => Math.min(q, variant.stock));
  }

  function handleAdd(thenCheckout: boolean) {
    if (!selected) {
      setSizeMissing(true);

      // Товч нь размерын хэсгээс доор байдаг тул буцааж дээш нь харуулна
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

      toast.error(color ? "Размераа сонгоно уу." : "Өнгө, размераа сонгоно уу.");
      return;
    }

    startTransition(async () => {
      const result = await addToCartAction({
        variantId: selected.id,
        quantity,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Сагсанд нэмэгдлээ.");

      /*
        Товч дээрх баталгааг асаана. Гэхдээ ЗӨВХӨН энэ хуудсанд
        үлдэх үед — "шууд худалдаж авах" нь өөр хуудас руу явах тул
        харагдах ч завгүй, дэмий дахин зурагдана.
      */
      if (!thenCheckout) {
        if (addedTimer.current) clearTimeout(addedTimer.current);

        setJustAdded(true);
        addedTimer.current = setTimeout(() => setJustAdded(false), 1800);
      }

      // Navbar дээрх сагсны тоог шинэчилнэ
      router.refresh();

      /*
        "Шууд худалдаж авах" нь сагс биш ТӨЛБӨР рүү очно.
        Сагс руу оруулбал хэрэглэгч дахин нэг товч дарах шаардлагатай
        болж, "шууд" гэсэн амлалт нь утгагүй болно.
      */
      if (thenCheckout) router.push("/checkout");
    });
  }

  return (
    <div>
      <Price
        basePrice={shownBase}
        discountPrice={shownDiscount}
        size="lg"
        showPercent
      />

      {afterPrice && <div className="mt-8">{afterPrice}</div>}

      {/* ӨНГӨ */}
      <fieldset className="mt-8">
        <legend className="label text-graphite">
          Өнгө{color && <span className="ml-2 text-ink">{color}</span>}
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {colors.map((option) => {
            const disabled = option.stock === 0;

            return (
              <button
                key={option.color}
                type="button"
                onClick={() => handleColorChange(option.color)}
                disabled={disabled}
                aria-pressed={color === option.color}
                title={disabled ? `${option.color} — дууссан` : option.color}
                className={cn(
                  "flex items-center gap-2 border px-3 py-2 text-xs transition-colors",
                  color === option.color
                    ? "border-ink"
                    : "border-line hover:border-graphite",
                  disabled && "cursor-not-allowed opacity-40 line-through",
                )}
              >
                <span
                  style={{ backgroundColor: option.colorHex }}
                  className="size-3.5 border border-line"
                />
                {option.color}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* РАЗМЕР */}
      <fieldset ref={sizeRef} className="mt-8 scroll-mt-24">
        <legend className="label flex w-full items-center justify-between gap-4 text-graphite">
          <span>
            Размер{size && <span className="ml-2 text-ink">{size}</span>}
          </span>
          <SizeGuideDialog />
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((option) => {
            const available = isSizeAvailable(variants, color, option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSizeChange(option)}
                disabled={!available}
                aria-pressed={size === option}
                title={available ? option : `${option} — дууссан`}
                className={cn(
                  "min-w-12 border px-3 py-2.5 text-center text-xs transition-colors",
                  size === option
                    ? "border-ink bg-ink text-bone"
                    : "border-line hover:border-graphite",
                  !available &&
                    "cursor-not-allowed border-line text-graphite line-through opacity-50 hover:border-line",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ҮЛДЭГДЭЛ — сонгосон хослолын дагуу */}
      <p className="mt-6 min-h-5 text-sm">
        {isSoldOut ? (
          <span className="label bg-ink px-2 py-1 text-bone">Дууссан</span>
        ) : !selected ? (
          /*
            Размер сонгоогүй үед хоёр байдал:
              энгийн  — саарал зөвлөмж
              алдаа   — сагсанд нэмэх гэж оролдсон. Улаан, тод, дүрстэй.
          */
          <span
            className={cn(
              "inline-flex items-center gap-2",
              sizeMissing ? "font-medium text-sale" : "text-graphite",
            )}
          >
            {sizeMissing && (
              <AlertCircle className="size-4 shrink-0" strokeWidth={2} />
            )}
            {sizeMissing
              ? "Размераа сонгоно уу."
              : "Үлдэгдлийг харахын тулд размераа сонгоно уу."}
          </span>
        ) : selected.stock <= LOW_STOCK_THRESHOLD ? (
          <span className="text-sale">
            Яараарай — зөвхөн {selected.stock} ширхэг үлдсэн
          </span>
        ) : (
          <span className="text-graphite">
            Бэлэн байгаа: {selected.stock} ширхэг
          </span>
        )}
      </p>

      {/* ТОО ШИРХЭГ */}
      <div className="mt-6 flex items-center gap-4">
        <span className="label text-graphite">Тоо</span>
        <QuantityInput
          value={quantity}
          onChange={setQuantity}
          max={maxQuantity}
          disabled={!selected || isSoldOut}
        />
      </div>

      {/* ҮЙЛДЛҮҮД */}
      <div className="mt-8 space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={() => handleAdd(false)}
            disabled={isPending || isSoldOut}
            className="label h-14 flex-1"
          >
            {/*
              `key` нь байдал солигдоход элементийг ШИНЭЭР үүсгэнэ —
              эс тэгвэл чагт зурагдах, бичиг мандах хөдөлгөөн дахин
              эхлэхгүй.

              ⚠️ Хоёр түлхүүр ЯЛГААТАЙ угтвартай байх ёстой. Эхэндээ
              хоёуланг нь "added"/"idle" гэж нэрлээд, ах дүү хоёр
              элемент ижил түлхүүртэй болчихсон байв. React тэгэхэд
              хуучин элементийг устгаж чадалгүй шинийг нь хажууд нь
              нэмдэг — товч дотор цүнх, чагт, дугуй гурав хуримтлагдаж
              эхэлсэн. Консол "two children with the same key" гэж
              шууд хэлж байсан.
            */}
            <AddToCartIcon
              key={`icon-${iconState}`}
              state={iconState}
            />

            <span key={`label-${justAdded}`} className="rise-in">
              {justAdded ? "Сагсанд нэмэгдлээ" : "Сагсанд нэмэх"}
            </span>
          </Button>

          <WishlistButton
            productId={productId}
            initialActive={inWishlist}
            className="size-14 shrink-0 border border-line bg-transparent"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => handleAdd(true)}
          disabled={isPending || isSoldOut}
          className="label h-14 w-full border"
        >
          Шууд худалдаж авах
        </Button>
      </div>
    </div>
  );
}

/**
 * "Сагсанд нэмэх" товчны дүрс — гурван байдал.
 *
 * ЯАГААД ТУСДАА КОМПОНЕНТ ВЭ?
 *   Гурван өөр дүрсийг товчны дотор шууд `? :`-ээр сольж байсан.
 *   Тэгэхэд React хуучин дүрсийг устгаж чадалгүй, шинийг нь хажууд
 *   нь нэмж тавьдаг байв — чагт, цүнх, эргэлдэх дугуй гурав нэг
 *   товч дотор зэрэгцэн хуримтлагдаж эхэлсэн.
 *
 *   Ганц компонент болгосноор товчны хүүхдүүд ҮРГЭЛЖ ижил хэвээр
 *   (дүрс + бичиг) үлдэж, дотор нь юу зурагдахыг `state` шийднэ.
 *
 * `state` солигдоход `key` нь ч солигдох тул чагт бүрэн эхнээсээ
 * зурагдана.
 */
function AddToCartIcon({ state }: { state: "idle" | "pending" | "added" }) {
  if (state === "pending") {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (state === "idle") {
    return <ShoppingBag className="size-4" />;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      {/* Өөрөө зурагдах чагт — хөдөлгөөнийг globals.css тайлбарласан */}
      <path d="M20 6 9 17l-5-5" className="check-draw" />
    </svg>
  );
}
