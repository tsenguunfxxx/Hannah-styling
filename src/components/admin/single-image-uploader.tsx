"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUploadSignatureAction } from "@/actions/admin/upload.action";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/constants";

/**
 * НЭГ зураг оруулах талбар.
 *
 * Барааны `ImageUploader`-той ижил зарчмаар ажиллана, гэхдээ
 * ганц зураг — дараалал, "үндсэн зураг" гэсэн ойлголт байхгүй.
 * Ангилал, баннер зэрэг нэг зурагтай зүйлд зориулав.
 *
 * ХОЁР ЗАМ:
 *   1. Файл сонгох → Cloudinary руу ШУУД. Манай сервер зөвхөн
 *      гарын үсэг зурж өгнө, файл дундаа орохгүй.
 *   2. Зургийн хаяг гараар буулгах — Cloudinary тохируулаагүй
 *      үед ч ажиллана.
 *
 * Хадгалагдах утга нь ЗӨВХӨН хаяг (string). Тиймээс солих юмуу
 * хасахад Cloudinary дээрх хуучин файл үлдэнэ — сар бүр цэвэрлэх
 * шаардлагагүй бага хэмжээ.
 */
export function SingleImageUploader({
  value,
  onChange,
  aspect = "aspect-4/5",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Урьдчилан харах хүрээний харьцаа — тухайн газартаа тааруулна */
  aspect?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();
  const [urlDraft, setUrlDraft] = useState("");

  function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    startUpload(async () => {
      const signature = await getUploadSignatureAction();

      if (!signature.success) {
        toast.error(signature.error);
        return;
      }

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signature.data.apiKey);
      body.append("timestamp", String(signature.data.timestamp));
      body.append("folder", signature.data.folder);
      body.append("signature", signature.data.signature);

      const response = await fetch(signature.data.url, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        toast.error(`${file.name} — байршуулж чадсангүй.`);
        return;
      }

      const json: { secure_url: string } = await response.json();

      onChange(json.secure_url);
      toast.success("Зураг байршлаа.");

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

    /*
      Зөвшөөрөгдсөн хостыг шалгана. Зөвхөн эмх цэгц биш —
      next.config.ts-д бүртгэгдээгүй хостын зургийг Next зурж
      чаддаггүй тул шалгахгүй бол хуудсан дээр хоосон нүх үлдэнэ.
    */
    if (!ALLOWED_IMAGE_HOSTS.some((allowed) => host === allowed)) {
      toast.error(`Зөвхөн ${ALLOWED_IMAGE_HOSTS.join(", ")} зөвшөөрнө.`);
      return;
    }

    onChange(url);
    setUrlDraft("");
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => handleFile(event.target.files)}
      />

      {value ? (
        <div className="flex flex-wrap items-start gap-4">
          <div
            className={`relative w-28 shrink-0 overflow-hidden bg-sand ${aspect}`}
          >
            {/*
              next/image биш энгийн img. Админ дөнгөж сая оруулсан
              зураг next.config-т бүртгэлгүй хостынх байж болох тул
              урьдчилан харах нь эвдрэхгүй.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-full object-cover" />
          </div>

          <div className="flex flex-wrap gap-2">
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
              Солих
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onChange(null)}
              className="label h-10"
            >
              <X className="size-3.5" />
              Хасах
            </Button>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
