"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Link2, Loader2, MoveLeft, MoveRight, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUploadSignatureAction } from "@/actions/admin/upload.action";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/constants";
import type { ProductImageInput } from "@/schemas/product.schema";

/**
 * Барааны зураг оруулах.
 *
 * ХОЁР ЗАМ:
 *   1. Файл сонгох → Cloudinary руу ШУУД (сервер зөвхөн гарын үсэг өгнө)
 *   2. Зургийн хаяг гараар буулгах (Cloudinary тохируулаагүй үед ч ажиллана)
 *
 * Эхний зураг = үндсэн зураг, хоёр дахь = hover зураг.
 */
export function ImageUploader({
  value,
  onChange,
}: {
  value: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();
  const [urlDraft, setUrlDraft] = useState("");

  /** Файлыг Cloudinary руу илгээнэ */
  async function uploadFile(file: File): Promise<ProductImageInput | null> {
    const signature = await getUploadSignatureAction();

    if (!signature.success) {
      toast.error(signature.error);
      return null;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.data.apiKey);
    body.append("timestamp", String(signature.data.timestamp));
    body.append("folder", signature.data.folder);
    body.append("signature", signature.data.signature);

    const response = await fetch(signature.data.url, { method: "POST", body });

    if (!response.ok) {
      toast.error(`${file.name} — байршуулж чадсангүй.`);
      return null;
    }

    const json: { secure_url: string; public_id: string } = await response.json();

    return { url: json.secure_url, publicId: json.public_id, alt: "" };
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    startUpload(async () => {
      const uploaded: ProductImageInput[] = [];

      for (const file of Array.from(files)) {
        const image = await uploadFile(file);
        if (image) uploaded.push(image);
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(`${uploaded.length} зураг нэмэгдлээ.`);
      }

      // Ижил файлыг дахин сонгож болохын тулд цэвэрлэнэ
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleAddUrl() {
    const url = urlDraft.trim();
    if (!url) return;

    let host = "";
    try {
      host = new URL(url).hostname;
    } catch {
      toast.error("Зургийн хаяг буруу байна.");
      return;
    }

    if (!ALLOWED_IMAGE_HOSTS.some((allowed) => host === allowed)) {
      toast.error(`Зөвхөн ${ALLOWED_IMAGE_HOSTS.join(", ")} зөвшөөрнө.`);
      return;
    }

    onChange([...value, { url, publicId: null, alt: "" }]);
    setUrlDraft("");
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  /** Зургийн дарааллыг солино — эхнийх нь үндсэн зураг болно */
  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {/* Оруулсан зургууд */}
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((image, index) => (
            <li key={`${image.url}-${index}`} className="group relative">
              <div className="relative aspect-3/4 overflow-hidden bg-sand">
                {/*
                  Энд next/image биш энгийн img ашиглав.
                  Админ дөнгөж сая оруулсан зураг next.config-т байхгүй
                  хостынх байж болох тул урьдчилан харах нь эвдрэхгүй.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt ?? ""}
                  className="size-full object-cover"
                />

                {index === 0 && (
                  <span className="label absolute top-1 left-1 bg-ink px-1.5 py-0.5 text-bone">
                    Үндсэн
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <IconButton
                    label="Зүүн тийш"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    <MoveLeft className="size-3" />
                  </IconButton>
                  <IconButton
                    label="Баруун тийш"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                  >
                    <MoveRight className="size-3" />
                  </IconButton>
                </div>

                <IconButton label="Зураг хасах" onClick={() => remove(index)}>
                  <X className="size-3" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Файл сонгох */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => handleFiles(event.target.files)}
        />

        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="label h-10"
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ImagePlus className="size-3.5" />
          )}
          Зураг байршуулах
        </Button>

        <span className="text-xs text-graphite">{value.length} зураг</span>
      </div>

      {/* Хаягаар нэмэх */}
      <div className="flex gap-2">
        <Input
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          placeholder="эсвэл зургийн хаягийг буулгана уу"
          // Enter дарахад маягт бүхэлдээ илгээгдэхээс сэргийлнэ
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddUrl();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddUrl}
          className="label h-10 shrink-0"
        >
          <Link2 className="size-3.5" />
          Нэмэх
        </Button>
      </div>

      <p className="text-xs text-graphite">
        Эхний зураг картан дээр, хоёр дахь нь хулгана дээр очиход харагдана.
      </p>
    </div>
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
      className="grid size-6 place-items-center border border-line text-graphite transition-colors hover:border-ink hover:text-ink disabled:opacity-30 disabled:hover:border-line"
    >
      {children}
    </button>
  );
}
