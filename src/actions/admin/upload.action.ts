"use server";

import { createHash } from "crypto";

import { getAdminOrThrow } from "@/lib/auth-guard";
import {
  CLOUDINARY_FOLDER,
  getCloudinaryConfig,
  uploadUrl,
} from "@/lib/cloudinary";
import type { ActionResult } from "@/types";

/**
 * Cloudinary-д ГАРЫН ҮСЭГ зурах.
 *
 * Яагаад ингэж хийв?
 *   Зургийг browser-оос ШУУД Cloudinary руу илгээнэ — манай сервер
 *   дундаа орохгүй тул хурдан, серверийн ачаалал бага.
 *
 *   Гэхдээ хэн ч зураг байршуулж болохгүй. Тиймээс сервер эхлээд
 *   "энэ хүсэлт зөвшөөрөгдсөн" гэсэн гарын үсэг өгнө. API_SECRET
 *   сервер дээр үлдэж, browser руу гарахгүй.
 */
export async function getUploadSignatureAction(): Promise<
  ActionResult<{
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
    url: string;
  }>
> {
  // Зөвхөн админ
  await getAdminOrThrow();

  const config = getCloudinaryConfig();

  if (!config) {
    return {
      success: false,
      error:
        "Cloudinary тохируулаагүй байна. .env файлд түлхүүрүүдээ нэмнэ үү.",
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary шаардлага: параметрүүдийг ЦАГААН ТОЛГОЙН дарааллаар
  // холбож, төгсгөлд нь api_secret залгаад sha1 хийнэ.
  const signature = createHash("sha1")
    .update(`folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${config.apiSecret}`)
    .digest("hex");

  return {
    success: true,
    data: {
      signature,
      timestamp,
      apiKey: config.apiKey,
      cloudName: config.cloudName,
      folder: CLOUDINARY_FOLDER,
      url: uploadUrl(config.cloudName),
    },
  };
}

/**
 * Cloudinary-гаас зураг устгах.
 * Бараанаас зураг хасахад агуулах дээр хог үлдэхгүй.
 */
export async function deleteCloudinaryImageAction(
  publicId: string,
): Promise<ActionResult<void>> {
  await getAdminOrThrow();

  const config = getCloudinaryConfig();
  if (!config) return { success: false, error: "Cloudinary тохируулаагүй." };

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`)
    .digest("hex");

  const body = new FormData();
  body.append("public_id", publicId);
  body.append("timestamp", String(timestamp));
  body.append("api_key", config.apiKey);
  body.append("signature", signature);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      { method: "POST", body },
    );

    if (!response.ok) {
      return { success: false, error: "Cloudinary зургийг устгаж чадсангүй." };
    }

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Cloudinary-тэй холбогдож чадсангүй." };
  }
}
