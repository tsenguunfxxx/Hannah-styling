import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma Client — өгөгдлийн сан руу хандах ГАНЦ цонх.
 *
 * Яагаад ийм ярвигтай бичсэн бэ?
 * Next.js dev горимд файл засах бүрд код дахин ачаалагддаг. Хэрэв энгийнээр
 * `new PrismaClient()` гэж бичвэл засвар бүрд шинэ холболт үүсээд, хэдхэн
 * минутын дараа Neon "хэт олон холболт" гэж алдаа өгнө.
 * Тиймээс үүсгэсэн client-ээ globalThis дээр хадгалж, дахин ашиглана.
 * Production дээр код нэг л удаа ачаалагддаг тул энэ асуудал байхгүй.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL олдсонгүй. .env файлдаа Neon-ийн connection string-ээ нэмнэ үү.",
  );
}

// Prisma 7-д өгөгдлийн сангийн холболтыг adapter дамжуулан хийдэг.
const adapter = new PrismaPg({ connectionString });

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
    // dev дээр ямар SQL явж байгааг терминалд харуулна
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
