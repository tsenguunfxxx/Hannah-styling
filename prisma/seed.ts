/**
 * Туршилтын өгөгдөл суулгах script.
 * Ажиллуулах:  npm run db:seed
 *
 * АНХААР: энэ script нь өмнөх бүх өгөгдлийг УСТГААД шинээр үүсгэнэ.
 * Зөвхөн хөгжүүлэлтийн database дээр ажиллуулна.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const COLORS = {
  black: { color: "Black", colorHex: "#111110" },
  white: { color: "White", colorHex: "#F5F4F0" },
  beige: { color: "Beige", colorHex: "#D9CFC0" },
  gray: { color: "Gray", colorHex: "#8A8880" },
  navy: { color: "Navy", colorHex: "#232B3A" },
  brown: { color: "Brown", colorHex: "#5C4433" },
};

const APPAREL_SIZES = ["S", "M", "L", "XL"];
const SHOE_SIZES = ["39", "40", "41", "42", "43"];

type ColorKey = keyof typeof COLORS;

/**
 * Өнгө бүрийг размер бүртэй үржүүлж variant үүсгэнэ.
 * stocks массив нь тухайн өнгөний размер тус бүрийн үлдэгдэл.
 */
function buildVariants(
  colors: ColorKey[],
  sizes: string[],
  stocks: number[][],
) {
  return colors.flatMap((key, ci) =>
    sizes.map((size, si) => ({
      ...COLORS[key],
      size,
      stock: stocks[ci]?.[si] ?? 0,
    })),
  );
}

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  details: string;
  basePrice: number;
  discountPrice?: number;
  categorySlug: string;
  isFeatured?: boolean;
  soldCount: number;
  images: string[];
  colors: ColorKey[];
  sizes: string[];
  stocks: number[][];
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Premium Oversized Hoodie",
    slug: "premium-oversized-hoodie",
    description:
      "Зузаан хөвөнгөн даавуугаар оёсон, чөлөөт хэлбэртэй капюшонтой цамц. Өдөр тутмын хэрэглээнд төгс.",
    details:
      "Материал: 80% хөвөн, 20% полиэстер\nЖин: 400 г/м²\nАрчилгаа: 30°C-т угаана, сэлгээгүй хатаана\nЗагвар: Oversized",
    basePrice: 199000,
    discountPrice: 149000,
    categorySlug: "eregtei-tsamts",
    isFeatured: true,
    soldCount: 142,
    images: ["1556821840-3a63f95609a7", "1620799140188-3b2a02fd9a77"],
    colors: ["gray", "white", "black"],
    sizes: APPAREL_SIZES,
    stocks: [
      [10, 15, 8, 4],
      [5, 12, 6, 0],
      [3, 7, 9, 2],
    ],
  },
  {
    name: "Essential Cotton Tee",
    slug: "essential-cotton-tee",
    description:
      "100% органик хөвөнгөөр хийсэн энгийн богино ханцуйтай цамц. Гардеробын суурь.",
    details:
      "Материал: 100% органик хөвөн\nЖин: 180 г/м²\nАрчилгаа: 30°C-т угаана\nЗагвар: Regular fit",
    basePrice: 59000,
    categorySlug: "eregtei-tsamts",
    soldCount: 318,
    images: ["1521572163474-6864f9cf17ab", "1618354691373-d851c5c3a990"],
    colors: ["white", "black", "beige"],
    sizes: APPAREL_SIZES,
    stocks: [
      [20, 25, 18, 10],
      [15, 22, 14, 8],
      [9, 11, 7, 3],
    ],
  },
  {
    name: "Heavyweight Crew Sweatshirt",
    slug: "heavyweight-crew-sweatshirt",
    description: "Зузаан, хэлбэрээ хадгалдаг дугуй хүзүүвчтэй свитшөрт.",
    details:
      "Материал: 100% сүлжмэл хөвөн\nЖин: 380 г/м²\nАрчилгаа: 30°C-т угаана\nЗагвар: Regular fit",
    basePrice: 139000,
    categorySlug: "eregtei-tsamts",
    soldCount: 87,
    images: ["1620799140408-edc6dcb6d633", "1523381210434-271e8be1f52b"],
    colors: ["white", "gray"],
    sizes: APPAREL_SIZES,
    stocks: [
      [7, 11, 8, 3],
      [5, 9, 6, 2],
    ],
  },
  {
    name: "Oversized Knit Sweater",
    slug: "oversized-knit-sweater",
    description: "Зөөлөн сүлжмэл, чөлөөт хэлбэртэй бүтэн ханцуйтай цамц.",
    details:
      "Материал: 55% ноос, 45% акрил\nАрчилгаа: Гараар угаана, хэвтээ байдлаар хатаана\nЗагвар: Oversized",
    basePrice: 179000,
    discountPrice: 139000,
    categorySlug: "emegtei-tsamts",
    soldCount: 96,
    images: ["1434389677669-e08b4cac3105", "1556905055-8f358a7a47b2"],
    colors: ["beige", "brown", "gray"],
    sizes: APPAREL_SIZES,
    stocks: [
      [6, 10, 7, 2],
      [4, 8, 5, 1],
      [3, 6, 4, 0],
    ],
  },
  {
    name: "Camel Wool Overcoat",
    slug: "camel-wool-overcoat",
    description:
      "Ноосон холимог даавуугаар оёсон урт пальто. Хүйтэн улиралд дулаан, хэлбэрээ хадгална.",
    details:
      "Материал: 70% ноос, 30% полиэстер\nДотор: Вискоз доторлогоо\nАрчилгаа: Хими цэвэрлэгээ\nУрт: Өвдөгний доор",
    basePrice: 459000,
    discountPrice: 379000,
    categorySlug: "emegtei-gaduur",
    isFeatured: true,
    soldCount: 54,
    images: ["1539533018447-63fcce2678e3"],
    colors: ["beige", "black"],
    sizes: APPAREL_SIZES,
    stocks: [
      [4, 6, 5, 2],
      [3, 5, 4, 1],
    ],
  },
  {
    name: "Leather Biker Jacket",
    slug: "leather-biker-jacket",
    description:
      "Жинхэнэ арьсаар хийсэн сонгодог мотоциклийн хүрэм. Жил өнгөрөх тусам гоё болно.",
    details:
      "Материал: 100% хонины арьс\nДотор: Хөвөнгөн доторлогоо\nАрчилгаа: Арьсны тусгай тосоор арчина",
    basePrice: 549000,
    categorySlug: "emegtei-gaduur",
    isFeatured: true,
    soldCount: 31,
    images: ["1551028719-00167b16eac5"],
    colors: ["black", "brown"],
    sizes: APPAREL_SIZES,
    stocks: [
      [2, 4, 3, 1],
      [1, 3, 2, 0],
    ],
  },
  {
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    description: "Хэзээ ч моднаос гарахгүй жинсэн хүрэм. Бүх улиралд тохирно.",
    details:
      "Материал: 100% хөвөн жинс\nАрчилгаа: Урвуулж 30°C-т угаана\nЗагвар: Regular fit",
    basePrice: 229000,
    categorySlug: "eregtei-gaduur",
    soldCount: 118,
    images: ["1611312449408-fcece27cdbb7", "1551537482-f2075a1d41f2"],
    colors: ["navy", "gray"],
    sizes: APPAREL_SIZES,
    stocks: [
      [6, 9, 7, 3],
      [4, 7, 5, 2],
    ],
  },
  {
    name: "Bomber Jacket",
    slug: "bomber-jacket",
    description: "Хөнгөн, богино хэлбэртэй бомбер хүрэм. Хавар намрын улиралд.",
    details:
      "Материал: Гадна 100% нейлон\nДотор: Тор доторлогоо\nАрчилгаа: 30°C-т угаана",
    basePrice: 279000,
    categorySlug: "eregtei-gaduur",
    soldCount: 62,
    images: ["1591047139829-d91aecb6caea"],
    colors: ["brown", "black"],
    sizes: APPAREL_SIZES,
    stocks: [
      [5, 8, 6, 2],
      [4, 7, 5, 1],
    ],
  },
  {
    name: "Tailored Wide Trousers",
    slug: "tailored-wide-trousers",
    description:
      "Өргөн хөлтэй, өндөр бэлхүүстэй, оффис болон өдөр тутамд тохирох өмд.",
    details:
      "Материал: 65% полиэстер, 32% вискоз, 3% эластан\nАрчилгаа: 30°C-т угаана\nЗагвар: High-waist, wide leg",
    basePrice: 169000,
    categorySlug: "emegtei-umd",
    soldCount: 129,
    images: ["1624378439575-d8705ad7ae80", "1473966968600-fa801b869a1a"],
    colors: ["black", "beige", "gray"],
    sizes: APPAREL_SIZES,
    stocks: [
      [8, 12, 9, 4],
      [6, 9, 7, 3],
      [4, 6, 5, 2],
    ],
  },
  {
    name: "Relaxed Jogger Pants",
    slug: "relaxed-jogger-pants",
    description: "Уян хатан бэлхүүстэй, тухтай өдөр тутмын өмд.",
    details:
      "Материал: 95% хөвөн, 5% эластан\nАрчилгаа: 30°C-т угаана\nЗагвар: Relaxed fit",
    basePrice: 99000,
    discountPrice: 79000,
    categorySlug: "emegtei-umd",
    soldCount: 143,
    images: ["1594633312681-425c7b97ccd1"],
    colors: ["beige", "gray", "black"],
    sizes: APPAREL_SIZES,
    stocks: [
      [9, 14, 10, 5],
      [7, 11, 8, 4],
      [6, 10, 7, 3],
    ],
  },
  {
    name: "Classic Straight Jeans",
    slug: "classic-straight-jeans",
    description: "Шулуун хэлбэртэй сонгодог жинс. Хэзээ ч моднаос гарахгүй.",
    details:
      "Материал: 98% хөвөн, 2% эластан\nАрчилгаа: Урвуулж 30°C-т угаана\nЗагвар: Straight fit",
    basePrice: 149000,
    categorySlug: "eregtei-umd",
    soldCount: 205,
    images: ["1602293589930-45aad59ba3ab", "1576995853123-5a10305d93c0"],
    colors: ["navy", "black"],
    sizes: APPAREL_SIZES,
    stocks: [
      [11, 16, 12, 6],
      [9, 14, 10, 5],
    ],
  },
  {
    name: "Evening Maxi Dress",
    slug: "evening-maxi-dress",
    description: "Урт, урсгал хэлбэртэй үдшийн даашинз.",
    details:
      "Материал: 100% вискоз\nАрчилгаа: Хими цэвэрлэгээ\nУрт: Шалны түвшинд",
    basePrice: 289000,
    categorySlug: "emegtei-daashinz",
    isFeatured: true,
    soldCount: 47,
    images: ["1595777457583-95e059d581b8", "1572804013309-59a88b7e92f1"],
    colors: ["black", "beige"],
    sizes: APPAREL_SIZES,
    stocks: [
      [5, 8, 6, 2],
      [3, 6, 4, 0],
    ],
  },
  {
    name: "Utility Jumpsuit",
    slug: "utility-jumpsuit",
    description: "Бүтэн биетэй, олон халаастай, тухтай комбинзон.",
    details:
      "Материал: 100% хөвөн твилл\nАрчилгаа: 30°C-т угаана\nЗагвар: Relaxed fit",
    basePrice: 219000,
    categorySlug: "emegtei-daashinz",
    soldCount: 38,
    images: ["1515886657613-9f3515b0c78f"],
    colors: ["beige", "black"],
    sizes: APPAREL_SIZES,
    stocks: [
      [4, 7, 5, 2],
      [3, 5, 4, 1],
    ],
  },
  {
    name: "Minimal Leather Sneakers",
    slug: "minimal-leather-sneakers",
    description: "Цэвэрхэн шугамтай арьсан пүүз. Бүх хувцастай зохицно.",
    details:
      "Гадна: Жинхэнэ үхрийн арьс\nУлавч: Резин\nАрчилгаа: Чийгтэй даавуугаар арчина",
    basePrice: 289000,
    categorySlug: "gutal",
    isFeatured: true,
    soldCount: 174,
    images: ["1560769629-975ec94e6a86", "1600185365483-26d7a4cc7519"],
    colors: ["white", "black"],
    sizes: SHOE_SIZES,
    stocks: [
      [4, 8, 10, 7, 3],
      [3, 6, 9, 5, 2],
    ],
  },
  {
    name: "Retro Running Sneakers",
    slug: "retro-running-sneakers",
    description: "Спорт болон өдөр тутмын хэрэглээнд тохирсон retro пүүз.",
    details:
      "Гадна: Нийлэг тор ба илэрхий арьс\nУлавч: EVA хөөс\nАрчилгаа: Гараар цэвэрлэнэ",
    basePrice: 249000,
    discountPrice: 199000,
    categorySlug: "gutal",
    soldCount: 121,
    images: ["1542291026-7eec264c27ff", "1549298916-b41d501d3772"],
    colors: ["brown", "black"],
    sizes: SHOE_SIZES,
    stocks: [
      [2, 5, 7, 4, 2],
      [1, 3, 5, 3, 0],
    ],
  },
  {
    name: "Structured Tote Bag",
    slug: "structured-tote-bag",
    description: "Хэлбэрээ хадгалдаг, өдөр тутмын том багтаамжтай цүнх.",
    details:
      "Материал: Жинхэнэ арьс\nХэмжээ: 38 x 30 x 12 см\nДотор: Ноутбукны тусгай хэсэгтэй",
    basePrice: 259000,
    categorySlug: "aksessuar",
    soldCount: 45,
    images: ["1584917865442-de89df76afd3"],
    colors: ["black", "brown"],
    sizes: ["ONE"],
    stocks: [[12], [8]],
  },
];

async function main() {
  console.log("🌱 Seed эхэллээ...\n");

  // --- 1. Хуучин өгөгдлийг цэвэрлэх (холбоосын дарааллаар) ---
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Хуучин өгөгдөл цэвэрлэгдлээ");

  // --- 2. Хэрэглэгчид ---
  const admin = await prisma.user.create({
    data: {
      name: "Hannah Admin",
      email: "admin@hannah.mn",
      password: bcrypt.hashSync("Admin123!", 10),
      role: "ADMIN",
      phone: "99119911",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Батбаяр",
      email: "bat@example.com",
      password: bcrypt.hashSync("Bat12345!", 10),
      role: "CUSTOMER",
      phone: "88008800",
      addresses: {
        create: {
          label: "Гэр",
          recipientName: "Батбаяр",
          phone: "88008800",
          district: "Сүхбаатар дүүрэг",
          addressLine: "1-р хороо, Their tower, 12 давхар, 1204 тоот",
          isDefault: true,
        },
      },
    },
  });
  console.log("👤 2 хэрэглэгч үүслээ (1 admin, 1 customer)");

  // --- 3. Ангилал (мод хэлбэрээр) ---
  const women = await prisma.category.create({
    data: {
      name: "Эмэгтэй",
      slug: "emegtei",
      sortOrder: 1,
      image: img("1490481651871-ab68de25d43d"),
    },
  });
  const men = await prisma.category.create({
    data: {
      name: "Эрэгтэй",
      slug: "eregtei",
      sortOrder: 2,
      image: img("1503341504253-dff4815485f1"),
    },
  });

  const childCategories = [
    { name: "Даашинз", slug: "emegtei-daashinz", parentId: women.id, sortOrder: 1 },
    { name: "Цамц", slug: "emegtei-tsamts", parentId: women.id, sortOrder: 2 },
    { name: "Өмд", slug: "emegtei-umd", parentId: women.id, sortOrder: 3 },
    { name: "Гадуур хувцас", slug: "emegtei-gaduur", parentId: women.id, sortOrder: 4 },
    { name: "Цамц", slug: "eregtei-tsamts", parentId: men.id, sortOrder: 1 },
    { name: "Өмд", slug: "eregtei-umd", parentId: men.id, sortOrder: 2 },
    { name: "Гадуур хувцас", slug: "eregtei-gaduur", parentId: men.id, sortOrder: 3 },
  ];

  for (const c of childCategories) {
    await prisma.category.create({ data: c });
  }

  await prisma.category.create({
    data: {
      name: "Гутал",
      slug: "gutal",
      sortOrder: 3,
      image: img("1441986300917-64674bd600d8"),
    },
  });
  await prisma.category.create({
    data: {
      name: "Аксессуар",
      slug: "aksessuar",
      sortOrder: 4,
      image: img("1591047139829-d91aecb6caea"),
    },
  });

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  console.log(`📁 ${categories.length} ангилал үүслээ`);

  // --- 4. Бараа + зураг + variant ---
  for (const p of PRODUCTS) {
    const categoryId = categoryBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Ангилал олдсонгүй: ${p.categorySlug}`);

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        details: p.details,
        basePrice: p.basePrice,
        discountPrice: p.discountPrice ?? null,
        // Эцсийн үнэ — шүүх, эрэмбэлэхэд ашиглана
        effectivePrice: p.discountPrice ?? p.basePrice,
        categoryId,
        isFeatured: p.isFeatured ?? false,
        soldCount: p.soldCount,
        images: {
          create: p.images.map((id, i) => ({
            url: img(id),
            alt: p.name,
            sortOrder: i,
          })),
        },
        variants: {
          create: buildVariants(p.colors, p.sizes, p.stocks),
        },
      },
    });
  }

  const variantCount = await prisma.productVariant.count();
  console.log(`👕 ${PRODUCTS.length} бараа, ${variantCount} variant үүслээ`);

  // --- 5. Сэтгэгдэл ---
  const hoodie = await prisma.product.findUnique({
    where: { slug: "premium-oversized-hoodie" },
  });
  const sneakers = await prisma.product.findUnique({
    where: { slug: "minimal-leather-sneakers" },
  });

  if (hoodie && sneakers) {
    await prisma.review.createMany({
      data: [
        {
          productId: hoodie.id,
          userId: customer.id,
          rating: 5,
          comment: "Материал нь үнэхээр зузаан, чанартай. Размер яг таарсан.",
        },
        {
          productId: sneakers.id,
          userId: customer.id,
          rating: 4,
          comment: "Гоё пүүз. Гэхдээ хэмжээ бага зэрэг жижигдүү санагдсан.",
        },
        {
          productId: hoodie.id,
          userId: admin.id,
          rating: 5,
          comment: "Хамгийн их зарагддаг бараа маань.",
        },
      ],
    });
    console.log("⭐ 3 сэтгэгдэл үүслээ");
  }

  // --- 6. Купон ---
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "PERCENT",
        value: 10,
        minOrder: 100000,
        maxUses: 500,
      },
      {
        code: "SALE20000",
        type: "FIXED",
        value: 20000,
        minOrder: 200000,
        maxUses: 100,
      },
    ],
  });
  console.log("🎟️  2 купон үүслээ");

  console.log("\n✅ Seed амжилттай дууслаа.");
  console.log("   Админ:    admin@hannah.mn / Admin123!");
  console.log("   Хэрэглэгч: bat@example.com / Bat12345!\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed алдаа гарлаа:\n", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
