/**
 * АДМИН ЭРХ УДИРДАХ
 *
 * Ажиллуулах:
 *   npm run admin                              — зөвхөн ХАРУУЛНА
 *   npm run admin -- --email=шинэ@gmail.com    — админы имэйлийг солино
 *   npm run admin -- --promote=байгаа@gmail.com — байгаа хэрэглэгчид админ эрх өгнө
 *   npm run admin -- --password                 — нууц үг солино (нуугдмал асуулт)
 *
 * Дээрх бүх үйлдэлд `--yes` нэмж өгөхөд л ЖИНХЭНЭЭР бичигдэнэ.
 * Үгүй бол юу болохыг харуулаад зогсоно.
 *
 * ЯАГААД СКРИПТЭЭР ВЭ?
 *   Имэйл солих нь энгийн засвар биш — нэвтрэх нэр өөрчлөгдөнө.
 *   Сайт дээр ийм товч тавивал шинэ хаягийг эзэмшдэг эсэхийг
 *   баталгаажуулах урт урсгал (баталгаажуулах код) хэрэгтэй болно.
 *   Дэлгүүр эзэн энэ засварыг амьдралдаа нэг л удаа хийх тул
 *   компьютер дээрээ ажиллуулах нь илүү зөв, аюулгүй.
 *
 * ⚠️ Имэйл сольсны дараа ЗААВАЛ гарч, дахин нэвтэрнэ үү.
 *    Нэвтэрсэн token дотор хуучин хаяг үлдсэн байдаг.
 */
import { createInterface } from "readline";
import { Writable } from "stream";

import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

/** Тушаалын мөрөөс `--нэр=утга` хэлбэрийн утгыг салгана */
function arg(name: string): string | undefined {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found?.slice(name.length + 3);
}

const has = (name: string) => process.argv.includes(`--${name}`);

/**
 * Нууц үгийг ДЭЛГЭЦЭНД ХАРУУЛАЛГҮЙ асууна.
 *
 * Тушаалын мөрөнд бичвэл терминалын түүхэнд (`~/.zsh_history`)
 * тодоор үлддэг тул тэгэхгүй.
 */
function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    /*
      Асуултыг харуулах ёстой, харин ХАРИУГ нь харуулахгүй.
      Тиймээс readline-д жинхэнэ дэлгэц биш, өөрсдийн "хаалт"-ыг
      өгнө: `muted` асаалттай үед бичигдсэн зүйлийг хаяна.
    */
    let muted = false;

    const output = new Writable({
      write(chunk, _encoding, callback) {
        if (!muted) process.stdout.write(chunk);
        callback();
      },
    });

    const rl = createInterface({ input: process.stdin, output, terminal: true });

    rl.question(question, (answer) => {
      process.stdout.write("\n");
      rl.close();
      resolve(answer);
    });

    // Асуулт бичигдсэний ДАРАА хаана — тэгэхгүй бол асуулт ч алга болно
    muted = true;
  });
}

/** Бүртгэлийн маягттай ижил шалгуур */
function checkPassword(value: string): string | null {
  if (value.length < 8) return "Дор хаяж 8 тэмдэгт байх ёстой.";
  if (!/[a-z]/.test(value)) return "Жижиг үсэг орсон байх ёстой.";
  if (!/[A-Z]/.test(value)) return "Том үсэг орсон байх ёстой.";
  if (!/[0-9]/.test(value)) return "Тоо орсон байх ёстой.";
  return null;
}

async function main() {
  const apply = has("yes");
  const newEmail = arg("email")?.trim().toLowerCase();
  const promote = arg("promote")?.trim().toLowerCase();
  const wantPassword = has("password");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, email: true, name: true, role: true, _count: { select: { orders: true } } },
  });

  console.log("\n👥 БҮРТГЭЛТЭЙ ХЭРЭГЛЭГЧИД\n");
  console.table(
    users.map((u) => ({
      имэйл: u.email,
      нэр: u.name ?? "-",
      эрх: u.role,
      захиалга: u._count.orders,
    })),
  );

  // Юу ч сонгоогүй бол зөвхөн жагсаалт үзүүлээд зогсоно
  if (!newEmail && !promote && !wantPassword) {
    console.log("Юу хийхээ сонгоно уу:");
    console.log("  npm run admin -- --email=шинэ@gmail.com --yes");
    console.log("  npm run admin -- --promote=байгаа@gmail.com --yes");
    console.log("  npm run admin -- --password --yes\n");
    return;
  }

  /* ----- 1. БАЙГАА ХЭРЭГЛЭГЧИД АДМИН ЭРХ ӨГӨХ ----- */
  if (promote) {
    const target = users.find((u) => u.email === promote);

    if (!target) {
      console.error(`\n❌ ${promote} гэсэн бүртгэл олдсонгүй.`);
      console.error("   Эхлээд тэр хаягаар сайт дээр бүртгүүлнэ үү.\n");
      process.exit(1);
    }

    if (target.role === "ADMIN") {
      console.log(`\n${promote} аль хэдийн админ байна.\n`);
      return;
    }

    console.log(`\n${promote}: CUSTOMER → ADMIN`);

    if (!apply) {
      console.log("\n→ Хийхийн тулд төгсгөлд нь --yes нэмнэ үү.\n");
      return;
    }

    await prisma.user.update({ where: { id: target.id }, data: { role: "ADMIN" } });
    console.log("\n✅ Админ эрх өглөө.\n");
    return;
  }

  /* ----- Дараах үйлдлүүд одоогийн админ дээр ажиллана ----- */
  const admins = users.filter((u) => u.role === "ADMIN");

  if (admins.length === 0) {
    console.error("\n❌ Админ бүртгэл алга.\n");
    process.exit(1);
  }

  if (admins.length > 1) {
    console.error("\n❌ Админ олон байна — алийг нь өөрчлөхийг таамаглахгүй.");
    console.error("   Илүүцийг нь эхлээд арилгана уу.\n");
    process.exit(1);
  }

  const admin = admins[0];

  /* ----- 2. ИМЭЙЛ СОЛИХ ----- */
  if (newEmail) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
      console.error(`\n❌ "${newEmail}" имэйл хаягийн хэлбэрт таарахгүй байна.\n`);
      process.exit(1);
    }

    // Имэйл нь @unique — өөр хүн эзэлсэн бол шинэчлэлт унана
    const taken = users.find((u) => u.email === newEmail && u.id !== admin.id);

    if (taken) {
      console.error(`\n❌ ${newEmail} хаягийг өөр бүртгэл эзэлсэн байна (${taken.role}).`);
      console.error("   Тэр бүртгэлдээ шууд админ эрх өгвөл илүү хялбар:");
      console.error(`   npm run admin -- --promote=${newEmail} --yes\n`);
      process.exit(1);
    }

    console.log(`\nИмэйл: ${admin.email} → ${newEmail}`);

    if (!apply) {
      console.log("\n→ Хийхийн тулд төгсгөлд нь --yes нэмнэ үү.\n");
      return;
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { email: newEmail, emailVerified: null },
    });

    console.log("\n✅ Имэйл солигдлоо.");
    console.log("⚠️  Сайтаас ГАРААД шинэ хаягаараа дахин нэвтэрнэ үү.\n");
  }

  /* ----- 3. НУУЦ ҮГ СОЛИХ ----- */
  if (wantPassword) {
    if (!apply) {
      console.log(`\n${admin.email}-ийн нууц үгийг солино.`);
      console.log("\n→ Хийхийн тулд төгсгөлд нь --yes нэмнэ үү.\n");
      return;
    }

    const password = await askHidden(`\n${admin.email} — шинэ нууц үг: `);
    const problem = checkPassword(password);

    if (problem) {
      console.error(`\n❌ ${problem}\n`);
      process.exit(1);
    }

    const again = await askHidden("Дахин бичнэ үү: ");

    if (password !== again) {
      console.error("\n❌ Хоёр нууц үг таарахгүй байна.\n");
      process.exit(1);
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { password: await bcrypt.hash(password, 10) },
    });

    console.log("\n✅ Нууц үг солигдлоо. Хуучин нь ажиллахаа больсон.\n");
  }
}

main()
  .catch((error) => {
    console.error("\n❌ Алдаа:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
