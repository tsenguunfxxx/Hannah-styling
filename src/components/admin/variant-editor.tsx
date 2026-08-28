"use client";

import { useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compareSizes } from "@/lib/variant-utils";
import type { ProductVariantInput } from "@/schemas/product.schema";

/** Түргэн үүсгэхэд санал болгох размерууд */
const SIZE_PRESETS = [
  { label: "Хувцас", sizes: ["S", "M", "L", "XL"] },
  { label: "Хувцас (XS-XXL)", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Гутал", sizes: ["39", "40", "41", "42", "43"] },
  { label: "Ганц хэмжээ", sizes: ["ONE"] },
];

/** Байнга хэрэглэгддэг өнгө */
const COLOR_PRESETS = [
  { name: "Black", hex: "#111110" },
  { name: "White", hex: "#f5f4f0" },
  { name: "Beige", hex: "#d8cbb4" },
  { name: "Gray", hex: "#8b8b88" },
  { name: "Brown", hex: "#6b4b33" },
  { name: "Navy", hex: "#22304a" },
];

/**
 * Размер + өнгөний хослолыг удирдах.
 *
 * Гараар 12 мөр нэмэх нь уйтгартай тул "түргэн үүсгэх" хэсэг бий:
 * размер, өнгө сонгоод дарвал бүх хослолыг үүсгэнэ.
 */
export function VariantEditor({
  value,
  onChange,
}: {
  value: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
}) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [customColor, setCustomColor] = useState({ name: "", hex: "#111110" });

  /** Хослол аль хэдийн байгаа эсэх */
  function exists(list: ProductVariantInput[], size: string, color: string) {
    return list.some(
      (v) =>
        v.size.toLowerCase() === size.toLowerCase() &&
        v.color.toLowerCase() === color.toLowerCase(),
    );
  }

  function generate() {
    if (sizes.length === 0 || colors.length === 0) {
      toast.error("Размер болон өнгө хоёуланг нь сонгоно уу.");
      return;
    }

    const next = [...value];
    let added = 0;

    for (const color of colors) {
      for (const size of sizes) {
        // Давхардсаныг алгасна — байгаа мөрийн үлдэгдэл алдагдахгүй
        if (exists(next, size, color.name)) continue;

        next.push({
          size,
          color: color.name,
          colorHex: color.hex,
          stock: 0,
          sku: "",
          price: null,
        });
        added++;
      }
    }

    if (added === 0) {
      toast.info("Бүх хослол аль хэдийн нэмэгдсэн байна.");
      return;
    }

    onChange(sortVariants(next));
    toast.success(`${added} хослол нэмэгдлээ.`);
  }

  function update(index: number, patch: Partial<ProductVariantInput>) {
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const totalStock = value.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="space-y-6">
      {/* --- ТҮРГЭН ҮҮСГЭХ --- */}
      <div className="border border-line p-4">
        <p className="label text-graphite">Түргэн үүсгэх</p>

        <div className="mt-4 space-y-4">
          {/* Размер */}
          <div>
            <p className="text-xs text-graphite">Размер</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSizes(preset.sizes)}
                  className="label border border-line px-3 py-2 transition-colors hover:border-ink"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {sizes.length > 0 && (
              <p className="mt-2 text-xs">Сонгосон: {sizes.join(", ")}</p>
            )}
          </div>

          {/* Өнгө */}
          <div>
            <p className="text-xs text-graphite">Өнгө</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => {
                const picked = colors.some((c) => c.name === preset.name);

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setColors((current) =>
                        picked
                          ? current.filter((c) => c.name !== preset.name)
                          : [...current, preset],
                      )
                    }
                    className={
                      "label flex items-center gap-2 border px-3 py-2 transition-colors " +
                      (picked ? "border-ink" : "border-line hover:border-graphite")
                    }
                  >
                    <span
                      style={{ backgroundColor: preset.hex }}
                      className="size-3 border border-line"
                    />
                    {preset.name}
                  </button>
                );
              })}
            </div>

            {/* Өөрийн өнгө */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Input
                value={customColor.name}
                onChange={(e) =>
                  setCustomColor({ ...customColor, name: e.target.value })
                }
                placeholder="Өнгөний нэр"
                className="w-40"
              />
              <input
                type="color"
                value={customColor.hex}
                onChange={(e) =>
                  setCustomColor({ ...customColor, hex: e.target.value })
                }
                aria-label="Өнгө сонгох"
                className="h-10 w-12 cursor-pointer border border-line bg-transparent"
              />
              <Button
                type="button"
                variant="outline"
                className="label h-10"
                onClick={() => {
                  if (!customColor.name.trim()) {
                    toast.error("Өнгөний нэрээ бичнэ үү.");
                    return;
                  }
                  setColors((current) => [
                    ...current,
                    { name: customColor.name.trim(), hex: customColor.hex },
                  ]);
                  setCustomColor({ name: "", hex: "#111110" });
                }}
              >
                <Plus className="size-3.5" />
                Өнгө нэмэх
              </Button>
            </div>

            {colors.length > 0 && (
              <p className="mt-2 text-xs">
                Сонгосон: {colors.map((c) => c.name).join(", ")}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={generate}
            className="label h-10"
          >
            <Wand2 className="size-3.5" />
            Хослолуудыг үүсгэх
          </Button>
        </div>
      </div>

      {/* --- ЖАГСААЛТ --- */}
      {value.length === 0 ? (
        <p className="border border-dashed border-line px-4 py-8 text-center text-sm text-graphite">
          Одоогоор размер, өнгө нэмээгүй байна.
        </p>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="label text-graphite">
              {value.length} хослол
            </p>
            <p className="label text-graphite">
              Нийт үлдэгдэл: {totalStock}
            </p>
          </div>

          <div className="mt-3 overflow-x-auto border border-line">
            <table className="w-full min-w-2xl border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-sand/50">
                  <Th>Өнгө</Th>
                  <Th>Размер</Th>
                  <Th>Үлдэгдэл</Th>
                  <Th>SKU</Th>
                  <Th>Тусгай үнэ</Th>
                  <Th />
                </tr>
              </thead>

              <tbody>
                {value.map((variant, index) => (
                  <tr
                    key={variant.id ?? `${variant.color}-${variant.size}-${index}`}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={variant.colorHex}
                          onChange={(e) =>
                            update(index, { colorHex: e.target.value })
                          }
                          aria-label={`${variant.color} өнгө`}
                          className="size-7 shrink-0 cursor-pointer border border-line bg-transparent"
                        />
                        <Input
                          value={variant.color}
                          onChange={(e) => update(index, { color: e.target.value })}
                          className="h-8 w-28"
                        />
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        value={variant.size}
                        onChange={(e) => update(index, { size: e.target.value })}
                        className="h-8 w-20"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        value={variant.stock}
                        onChange={(e) =>
                          update(index, { stock: Number(e.target.value) })
                        }
                        className="h-8 w-24"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        value={variant.sku ?? ""}
                        onChange={(e) => update(index, { sku: e.target.value })}
                        placeholder="—"
                        className="h-8 w-28"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        value={variant.price ?? ""}
                        onChange={(e) =>
                          update(index, {
                            // Хоосон бол барааны үндсэн үнийг ашиглана
                            price: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="Үндсэн үнэ"
                        className="h-8 w-32"
                      />
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`${variant.color} ${variant.size} хасах`}
                        className="grid size-8 place-items-center text-graphite transition-colors hover:text-sale"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/** Өнгө → размерын зөв дарааллаар эрэмбэлнэ */
function sortVariants(variants: ProductVariantInput[]): ProductVariantInput[] {
  return [...variants].sort(
    (a, b) => a.color.localeCompare(b.color) || compareSizes(a.size, b.size),
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th scope="col" className="label px-3 py-2 text-left text-graphite">
      {children}
    </th>
  );
}
