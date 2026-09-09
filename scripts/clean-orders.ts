/**
 * ЗАХИАЛГА ЦЭВЭРЛЭХ
 *
 * Ажиллуулах:
 *   npm run clean:orders          — зөвхөн ХАРУУЛНА
 *   npm run clean:orders -- --yes — УСТГАНА
 *
 * ЗӨВХӨН захиалгыг устгана. Хэрэглэгч, бараа, ангилал, тэдний
 * хадгалсан хаяг бүгд хэвээр үлдэнэ.
 *
 * Захиалгын төлбөр (Payment) ба барааны мөр (OrderItem) нь
 * Cascade дүрмээр хамт устана — тусад нь устгах шаардлагагүй.
 *
 * ⚠️ БУЦААХ БОЛОМЖГҮЙ.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  const apply = process.argv.includes("--yes");

  const orders = await prisma.order.findMany({
    select: {
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length === 0) {
    console.log("\nЗахиалга байхгүй — цэвэрлэх зүйл алга.\n");
    return;
  }

  console.log(apply ? "\n🗑  УСТГАХ ГОРИМ\n" : "\n👀 ЗӨВХӨН ХАРУУЛАХ (устгах бол -- --yes)\n");

  console.table(
    orders.map((o) => ({
      дугаар: o.orderNumber,
      хэрэглэгч: o.user?.email ?? "-",
      дүн: `${o.total.toLocaleString()}₮`,
      төлөв: o.status,
    })),
  );

  console.log(
    `Захиалга: ${orders.length} | төлбөр: ${await prisma.payment.count()} | мөр: ${await prisma.orderItem.count()}`,
  );

  if (!apply) {
    console.log("\n→ Устгахын тулд:  npm run clean:orders -- --yes\n");
    return;
  }

  await prisma.order.deleteMany({});

  /*
    "Зарагдсан" тоог 0 болгоно — захиалга байхгүй болсон тул тэр
    тоо ямар ч эх сурвалжгүй үлдэнэ.

    Үлдэгдлийг (stock) ЗОРИУДААР хөндөөгүй. Захиалга устгахад
    үлдэгдэл өөрөө сэргэдэггүй ч, зөв тоог зөвхөн дэлгүүр эзэн
    мэднэ — админ → Бараа хэсгээс тохируулна.
  */
  await prisma.product.updateMany({ data: { soldCount: 0 } });

  console.log("\n✅ Устгалаа.");
  console.table([
    {
      захиалга: await prisma.order.count(),
      хэрэглэгч: await prisma.user.count(),
      бараа: await prisma.product.count(),
      "хадгалсан хаяг": await prisma.address.count(),
    },
  ]);
  console.log("Үлдэгдлийг админ → Бараа хэсгээс шалгаарай.\n");
}

main().catch((error) => {
  console.error("\n❌ Алдаа:", error instanceof Error ? error.message : error);
  process.exit(1);
});
