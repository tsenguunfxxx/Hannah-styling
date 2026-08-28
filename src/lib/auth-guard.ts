import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Эрхийн шалгалт. Server Component болон Server Action-д ашиглана.
 *
 * ЧУХАЛ: proxy.ts дээрх шалгалт нь зөвхөн ХУРДАН шүүлт.
 * Жинхэнэ хамгаалалт нь ЭНД — өгөгдөл уншиж, бичих газартаа шалгана.
 */

/**
 * Нэвтэрсэн эсэхийг шалгана. Үгүй бол /login руу шидэнэ.
 *
 * ЗӨВХӨН token байгаа эсэхийг биш, тэр хэрэглэгч ҮНЭХЭЭР
 * database-д байгаа эсэхийг ч шалгана.
 *
 * Яагаад? Token нь 30 хоног хүчинтэй. Тэр хугацаанд хэрэглэгчийн
 * бүртгэл уствал (админ устгасан, эсвэл seed дахин ажилласан)
 * token нь хүчинтэй хэвээр үлдэнэ. Тэгвэл:
 *   - profile хуудас `findUniqueOrThrow` дээр унана
 *   - /login руу ч орж чадахгүй — proxy.ts "нэвтэрсэн" гэж үзнэ
 * Ийм гацаанаас гаргахын тулд cookie-г арчиж, /login руу гаргана.
 *
 * Хэрэглэгчийн мэдээллийг ХАМТ буцаана — хуудас дахин асуух шаардлагагүй.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/api/auth/force-signout");
  }

  return { session, user };
}

/** ADMIN эсэхийг шалгана. Үгүй бол нүүр рүү буцаана. */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

/**
 * Server Action дотор ашиглах хувилбар.
 * redirect хийхийн оронд алдаа шиддэг — action нь алдааг барьж
 * хэрэглэгчид ойлгомжтой мессеж буцаана.
 */
export async function getAdminOrThrow() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Танд энэ үйлдлийг хийх эрх байхгүй.");
  }

  return session;
}

export async function getUserOrThrow() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Эхлээд нэвтэрнэ үү.");
  }

  // Устсан хэрэглэгчийн token-оор өгөгдөл бичихээс сэргийлнэ
  const exists = await prisma.user.count({ where: { id: session.user.id } });

  if (exists === 0) {
    throw new Error("Таны бүртгэл олдсонгүй. Дахин нэвтэрнэ үү.");
  }

  return session;
}
