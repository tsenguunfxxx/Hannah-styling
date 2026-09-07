/**
 * WIRE.MN-ИЙН WEBHOOK ХАЯГ БҮРТГЭХ
 *
 * Ажиллуулах:
 *   npm run wire:webhook -- https://www.hannah-styling.com
 *
 * Юу хийх вэ:
 *   1. Өгсөн хаяг дээр /api/payment/wire/callback залгана
 *   2. wire.mn дээр webhook endpoint үүсгэнэ
 *   3. Нууц түлхүүрийг (whsec_...) дэлгэц дээр хэвлэнэ
 *
 * ⚠️ Түлхүүр нь ЗӨВХӨН НЭГ УДАА харагдана. Тэр дороо .env-д хуулна.
 *    Алдвал шинэ endpoint үүсгэхээс өөр арга байхгүй.
 */

const API_BASE = "https://api.wire.mn/v1";

async function main() {
  const key = process.env.WIRE_SECRET_KEY?.trim();
  const siteUrl = process.argv[2]?.replace(/\/+$/, "");

  if (!key) {
    console.error("\n❌ .env дотор WIRE_SECRET_KEY тохируулаагүй байна.");
    console.error("   app.wire.mn → API keys хэсгээс авна.\n");
    process.exit(1);
  }

  if (!siteUrl) {
    console.error("\n❌ Сайтын хаягаа өгнө үү:");
    console.error("   npm run wire:webhook -- https://www.hannah-styling.com\n");
    process.exit(1);
  }

  // wire.mn нь HTTPS шаарддаг — localhost ажиллахгүй
  if (!siteUrl.startsWith("https://")) {
    console.error("\n❌ Хаяг https:// -ээр эхлэх ёстой.");
    console.error("   Локал хаяг (localhost) ажиллахгүй — wire.mn гаднаас");
    console.error("   залгах тул интернэтэд нээлттэй хаяг хэрэгтэй.\n");
    process.exit(1);
  }

  const callbackUrl = `${siteUrl}/api/payment/wire/callback`;
  const live = key.startsWith("sk_live_");

  console.log(`\nГорим     : ${live ? "БОДИТ (sk_live)" : "туршилт (sk_test)"}`);
  console.log(`Хаяг      : ${callbackUrl}\n`);

  const response = await fetch(`${API_BASE}/webhook_endpoints`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // Дахин ажиллуулбал шинэ endpoint үүсэхгүй
      "Idempotency-Key": `hannah-webhook-${siteUrl}`,
    },
    body: JSON.stringify({
      url: callbackUrl,
      enabled_events: ["payment_intent.succeeded"],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`❌ Үүсгэж чадсангүй (${response.status}):`);
    console.error(`   ${detail.slice(0, 300)}\n`);
    process.exit(1);
  }

  const json = (await response.json()) as {
    id: string;
    status: string;
    secret?: string;
  };

  console.log(`✅ Endpoint үүслээ`);
  console.log(`   id     : ${json.id}`);
  console.log(`   төлөв  : ${json.status}`);

  if (!json.secret) {
    console.log(
      "\n⚠️  Хариунд түлхүүр ирсэнгүй. app.wire.mn → Webhooks хэсгээс хараарай.\n",
    );
    return;
  }

  console.log(`\n⚠️  ДООРХ ТҮЛХҮҮР ЗӨВХӨН ОДОО ХАРАГДАНА. .env-д хуулна уу:\n`);
  console.log(`WIRE_WEBHOOK_SECRET="${json.secret}"\n`);
  console.log(`Дараа нь Vercel → Settings → Environment Variables дээр ч`);
  console.log(`ижил утгыг нэмээд Redeploy хийнэ.\n`);
}

main().catch((error) => {
  console.error("\n❌ Алдаа:", error instanceof Error ? error.message : error);
  process.exit(1);
});
