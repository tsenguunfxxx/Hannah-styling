/**
 * ИМЭЙЛ ТОХИРГООГОО ШАЛГАХ
 *
 * Ажиллуулах:
 *   npm run test:email -- name@example.com
 *
 * Юу шалгах вэ:
 *   - .env доторх түлхүүр зөв эсэх
 *   - Илгээгч хаяг (EMAIL_FROM) зөвшөөрөгдсөн эсэх
 *   - Захидал үнэхээр очиж байгаа эсэх
 */
import { sendEmail } from "../src/lib/mailer";

async function main() {
  const to = process.argv[2];

  if (!to) {
    console.error("❌ Хаяг оруулна уу:  npm run test:email -- name@example.com");
    process.exit(1);
  }

  const provider = process.env.EMAIL_PROVIDER || "(тохируулаагүй)";
  console.log(`\nEMAIL_PROVIDER : ${provider}`);
  console.log(`EMAIL_FROM     : ${process.env.EMAIL_FROM || "(анхдагч)"}`);
  console.log(`Хүлээн авагч   : ${to}\n`);

  const result = await sendEmail(
    to,
    "HANNAH — туршилтын захидал",
    `<div style="font-family:Helvetica,Arial,sans-serif;padding:24px">
       <h1 style="font-size:18px;font-weight:500">Тохиргоо ажиллаж байна 🎉</h1>
       <p style="font-size:14px;color:#4a4a4a">
         Энэ захидлыг харж байгаа бол нууц үг сэргээх код ч мөн адил очно.
       </p>
     </div>`,
  );

  if (!result.ok) {
    console.error("❌ Амжилтгүй:", result.error);
    console.error("   Дэлгэрэнгүйг дээрх алдааны мессежээс хараарай.\n");
    process.exit(1);
  }

  if (!result.delivered) {
    console.warn("⚠️  EMAIL_PROVIDER тохируулаагүй тул ЮУ Ч ИЛГЭЭГДСЭНГҮЙ.\n");
    process.exit(1);
  }

  console.log("✅ Илгээгдлээ. Inbox болон Spam хавтсаа шалгаарай.\n");
}

main();
