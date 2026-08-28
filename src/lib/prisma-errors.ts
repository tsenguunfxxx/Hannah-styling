import { Prisma } from "@/generated/prisma/client";

/**
 * Prisma-ийн алдааг ХҮНД ойлгомжтой мессеж болгох туслах.
 *
 * Яагаад тусдаа файл вэ?
 *   Prisma 7 driver adapter ашиглахад давхардсан талбарын нэр нь
 *   `meta.target` дотор биш, `meta.driverAdapterError` дотор ирдэг.
 *   Хоёр хэлбэрийг нэг газар барьж байвал action бүрт давтахгүй.
 */

/** Давхардсан утга гарсан талбаруудын нэр */
export function getUniqueConflictFields(error: unknown): string[] {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return [];
  }

  const meta = error.meta as Record<string, unknown> | undefined;

  // 1) Сонгодог хэлбэр: meta.target = ["slug"] эсвэл "slug"
  const target = meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];

  // 2) Driver adapter хэлбэр
  const adapterError = meta?.driverAdapterError as
    | { cause?: { constraint?: { fields?: string[] } } }
    | undefined;

  return adapterError?.cause?.constraint?.fields ?? [];
}

/** P2002 (давхардсан утга) алдаа мөн эсэх */
export function isUniqueConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
