/**
 * Cloudinary тохиргоо.
 *
 * Түлхүүрүүд .env дотор байна. API_SECRET нь ЗӨВХӨН сервер дээр —
 * NEXT_PUBLIC_ угтвартай биш тул browser руу хэзээ ч явахгүй.
 */

export const CLOUDINARY_FOLDER = "hannah/products";

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

/**
 * Тохиргоог уншина. Дутуу бол null.
 * Cloudinary тохируулаагүй байсан ч админ зургийн ХАЯГ гараар
 * оруулж чадах тул систем ажиллаж чадна.
 */
export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  return { cloudName, apiKey, apiSecret };
}

/** Cloudinary-ийн upload хаяг */
export function uploadUrl(cloudName: string): string {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}
