/**
 * Өгөгдлийн сангийн холболт болон агуулгыг шалгах script.
 * Ажиллуулах:  npm run db:check
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const url = process.env.DATABASE_URL;

  if (!url || url.includes("ЭНД_NEON")) {
    console.error("\n❌ DATABASE_URL тохируулаагүй байна.");
    console.error("   .env файлаа нээж Neon-ийн connection string-ээ тавина уу.\n");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  try {
    const [row] = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`;
    console.log("\n✅ Өгөгдлийн сантай холбогдлоо.");
    console.log(`   ${row.version.split(",")[0]}\n`);

    const counts = {
      "Хэрэглэгч": await prisma.user.count(),
      "Ангилал": await prisma.category.count(),
      "Бараа": await prisma.product.count(),
      "Variant": await prisma.productVariant.count(),
      "Зураг": await prisma.productImage.count(),
      "Сэтгэгдэл": await prisma.review.count(),
      "Купон": await prisma.coupon.count(),
      "Захиалга": await prisma.order.count(),
    };

    for (const [name, count] of Object.entries(counts)) {
      console.log(`   ${name.padEnd(12)} ${count}`);
    }

    // Үлдэгдэл дууссан variant хэд байна вэ
    const soldOut = await prisma.productVariant.count({ where: { stock: 0 } });
    console.log(`\n   Дууссан variant: ${soldOut}\n`);
  } catch (error) {
    console.error("\n❌ Холбогдож чадсангүй.");
    console.error(error instanceof Error ? `   ${error.message}` : error);
    console.error("\n   Шалгах зүйлс:");
    console.error("   1. Connection string бүтнээрээ хуулагдсан уу");
    console.error("   2. Neon дээрх project идэвхтэй байна уу");
    console.error("   3. npm run db:push ажиллуулсан уу\n");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
