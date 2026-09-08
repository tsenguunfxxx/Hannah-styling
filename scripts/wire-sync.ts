/**
 * WIRE.MN-ТЭЙ ТУЛГАХ
 *
 * Ажиллуулах:
 *   npm run wire:sync          — зөвхөн ХАРУУЛНА, юу ч өөрчлөхгүй
 *   npm run wire:sync -- --fix — зөрүүг ЗАСНА
 *
 * ЗОРИЛГО:
 *   Ердийн үед төлбөр орсныг wire.mn webhook-оор мэдэгддэг. Гэвч
 *   webhook унтраалттай, сервер түр унтарсан, эсвэл сүлжээ тасарсан
 *   үед тэр мэдэгдэл хүрэхгүй өнгөрч болно. Тэгвэл ХУДАЛДАН АВАГЧ
 *   мөнгөө төлсөн атлаа захиалга нь "төлөгдөөгүй" хэвээр үлдэнэ.
 *
 *   Энэ скрипт wire.mn-ийг ЭХ СУРВАЛЖ болгож, манай сангийн
 *   төлвийг түүнтэй тулгана.
 *
 * АЮУЛГҮЙ БАЙДАЛ:
 *   - Анхдагчаар зөвхөн харуулна (--fix өгөхгүй бол юу ч бичихгүй)
 *   - Зөвхөн wire.mn "succeeded" гэсэн нэхэмжлэхийг л төлөгдсөн гэнэ
 *   - Захиалгыг зөвхөн PENDING үед л урагшлуулна — админ аль хэдийн
 *     хүргэлтэнд гаргасан бол буцаахгүй
 */
import { prisma } from "../src/lib/prisma";

type WireIntent = { id: string; amount: number; status: string };

async function main() {
  const fix = process.argv.includes("--fix");
  const key = process.env.WIRE_SECRET_KEY?.trim();

  if (!key) {
    console.error("\n❌ WIRE_SECRET_KEY тохируулаагүй байна.\n");
    process.exit(1);
  }

  console.log(fix ? "\n🔧 ЗАСАХ горим\n" : "\n👀 ЗӨВХӨН ХАРУУЛАХ горим (засах бол -- --fix)\n");

  const response = await fetch("https://api.wire.mn/v1/payment_intents?limit=100", {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!response.ok) {
    console.error(`❌ wire.mn-ээс жагсаалт авч чадсангүй (${response.status})`);
    process.exit(1);
  }

  const intents: WireIntent[] = (await response.json()).data ?? [];
  const succeeded = intents.filter((i) => i.status === "succeeded");

  console.log(`wire.mn дээр амжилттай төлөгдсөн: ${succeeded.length}\n`);

  let fixed = 0;
  let alreadyFine = 0;

  for (const intent of succeeded) {
    const payment = await prisma.payment.findFirst({
      where: { wireIntentId: intent.id },
      select: {
        id: true,
        status: true,
        orderId: true,
        order: { select: { orderNumber: true, status: true } },
      },
    });

    if (!payment) {
      console.log(`⚠️  ${intent.id} — манай санд таарах захиалга алга`);
      continue;
    }

    const label = payment.order.orderNumber;
    const paymentWrong = payment.status !== "PAID";
    const orderWrong = payment.order.status === "PENDING";

    if (!paymentWrong && !orderWrong) {
      alreadyFine += 1;
      continue;
    }

    const parts = [
      paymentWrong ? `төлбөр ${payment.status} → PAID` : null,
      orderWrong ? "захиалга PENDING → CONFIRMED" : null,
    ].filter(Boolean);

    console.log(`${fix ? "✅" : "•"} ${label}: ${parts.join(", ")}`);

    if (fix) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId: intent.id,
          },
        }),
        prisma.order.updateMany({
          where: { id: payment.orderId, status: "PENDING" },
          data: { status: "CONFIRMED" },
        }),
      ]);
    }

    fixed += 1;
  }

  console.log(`\nЗөв байсан : ${alreadyFine}`);
  console.log(`Зөрүүтэй   : ${fixed}`);

  if (fixed > 0 && !fix) {
    console.log("\n→ Засахын тулд:  npm run wire:sync -- --fix\n");
  } else {
    console.log("");
  }
}

main().catch((error) => {
  console.error("\n❌ Алдаа:", error instanceof Error ? error.message : error);
  process.exit(1);
});
