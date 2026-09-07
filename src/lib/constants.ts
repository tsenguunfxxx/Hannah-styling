/**
 * Сайтын тогтмол утгууд.
 * Хатуу бичсэн тоо, текстийг код дотор тараахгүй — бүгд ЭНД.
 */

export const SITE = {
  name: "HANNAH",
  tagline: "Өөрийн хэв маягаа бүтээ.",
  description: "Хүүхдийн Өдөр тутмын ELEGANT хувцас.",
} as const;

/**
 * НИЙГМИЙН СҮЛЖЭЭНИЙ ХОЛБООС
 *
 * ⬇️ ӨӨРИЙН ХУУДСЫН ХАЯГАА ЭНД ТАВИНА ⬇️
 *
 * Хэрхэн олох вэ:
 *   Instagram — профайлаа нээгээд browser-ийн хаяг дээрх бүтэн мөрийг хуулна.
 *               Жишээ: https://www.instagram.com/hannah.styling
 *   Facebook  — хуудсаа нээгээд хаягийг хуулна.
 *               Жишээ: https://www.facebook.com/hannahstyling
 *   Telegram  — сувгийнхаа нэрийг ашиглана.
 *               Жишээ: https://t.me/hannahstyling
 *
 * Хаяг нь ЗААВАЛ https:// -ээр эхлэх ёстой. Үгүй бол сайт дотроо
 * "/instagram.com/..." гэсэн байхгүй хуудас руу очих гэж оролдоно.
 *
 * Ямар нэг сүлжээ ашиглахгүй бол тухайн мөрийг устгахад л хангалттай —
 * footer-т тэр тэмдэг харагдахаа болино.
 */
export const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/hannah_mongolia?igsi=MXA0YWZ2czdmeTAwMw==",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1CLCvdVfBx/?mibextid=wwXIfr",
  },
  { label: "Telegram", href: "https://t.me" },
] as const;

/** Navbar-ийн дунд хэсгийн цэс */
export const NAV_LINKS = [
  { label: "Нүүр", href: "/" },
  { label: "Дэлгүүр", href: "/shop" },
  { label: "Шинэ бараа", href: "/shop?sort=newest" },
  { label: "Collection", href: "/shop?featured=true" },
  { label: "Sale", href: "/shop?sale=true" },
] as const;

/** Барааны размерууд */
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

/** Захиалгын төлөв — монгол нэр, дараагийн боломжит төлөв */
export const ORDER_STATUS = {
  PENDING: { label: "Хүлээгдэж байна", next: ["CONFIRMED", "CANCELLED"] },
  CONFIRMED: { label: "Баталгаажсан", next: ["PROCESSING", "CANCELLED"] },
  PROCESSING: { label: "Бэлтгэж байна", next: ["SHIPPED", "CANCELLED"] },
  SHIPPED: { label: "Хүргэлтэнд гарсан", next: ["DELIVERED"] },
  DELIVERED: { label: "Хүргэгдсэн", next: [] },
  CANCELLED: { label: "Цуцлагдсан", next: [] },
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS;

/** Төлбөрийн аргууд */
export const PAYMENT_METHODS = [
  { value: "QPAY", label: "QPay", hint: "QR кодоор шууд төлөх" },
  {
    value: "WIRE",
    label: "Wire",
    hint: "Банкны апп, хэтэвч, QR — нэг дор",
  },
  {
    value: "BANK_TRANSFER",
    label: "Банкны шилжүүлэг",
    hint: "Дансаар шилжүүлэх",
  },
  { value: "COD", label: "Хүргэлтээр төлөх", hint: "Бараагаа хүлээж авахдаа" },
] as const;

/** Хүргэлт */
export const SHIPPING_FEE = 5000; // ₮
export const FREE_SHIPPING_THRESHOLD = 150000; // энэ дүнгээс дээш үнэгүй

/** Үлдэгдэл энэ тооноос доош болбол "цөөхөн үлдсэн" гэж анхааруулна */
export const LOW_STOCK_THRESHOLD = 5;

/** Нэг хуудсанд харуулах барааны тоо */
export const PRODUCTS_PER_PAGE = 12;

/** Нэг барааг нэг удаад хамгийн ихдээ хэдийг сагсанд хийж болох вэ */
export const MAX_QUANTITY_PER_ITEM = 10;

/**
 * Размерын заавар — см-ээр.
 * Дэлгэрэнгүй хуудасны "Размерын заавар" таб дээр хүснэгт болж харагдана.
 */
export const SIZE_GUIDE = {
  columns: ["Размер", "Цээж", "Бэлхүүс", "Ташаа", "Ханцуй"],
  rows: [
    ["XS", "82-86", "62-66", "88-92", "58"],
    ["S", "86-90", "66-70", "92-96", "59"],
    ["M", "90-96", "70-76", "96-102", "60"],
    ["L", "96-102", "76-82", "102-108", "61"],
    ["XL", "102-110", "82-90", "108-116", "62"],
    ["XXL", "110-118", "90-98", "116-124", "63"],
  ],
  note: "Хэмжээ нь биеийн хэмжээ болохоос хувцасны хэмжээ биш. Хоёр размерын завсарт байвал томыг нь сонгохыг зөвлөж байна.",
} as const;

/** Улаанбаатарын дүүргүүд — checkout-ийн сонголт */
export const DISTRICTS = [
  "Баянгол",
  "Баянзүрх",
  "Сүхбаатар",
  "Хан-Уул",
  "Чингэлтэй",
  "Сонгинохайрхан",
  "Налайх",
  "Багануур",
  "Багахангай",
] as const;

/**
 * Захиалгын дугаарын угтвар: HN-260826-0001
 * HN = HANNAH, дараа нь огноо, дараа нь тухайн өдрийн дугаарлалт.
 */
export const ORDER_NUMBER_PREFIX = "HN";

/**
 * Зөвшөөрөгдсөн зургийн хост.
 *
 * next/image нь next.config.ts дотор бүртгэгдсэн хостоос л зураг татна.
 * Тиймээс энд байхгүй хостын зураг оруулбал дэлгүүр дээр зураг гарахгүй.
 * Шинэ хост нэмэх бол ЭНД болон next.config.ts-д ХОЁУЛАНД нь нэмнэ.
 */
export const ALLOWED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "images.unsplash.com",
] as const;

/** Төлбөрийн төлөв — монгол нэр */
export const PAYMENT_STATUS = {
  PENDING: { label: "Төлөгдөөгүй" },
  PAID: { label: "Төлөгдсөн" },
  FAILED: { label: "Амжилтгүй" },
  REFUNDED: { label: "Буцаагдсан" },
} as const;

export type PaymentStatusKey = keyof typeof PAYMENT_STATUS;

/**
 * Банкны шилжүүлгийн данснууд.
 *
 * Хэрэглэгч эдгээрийн аль нэг рүү шилжүүлээд гүйлгээний утганд
 * ЗАХИАЛГЫН ДУГААРАА бичнэ. Ингэснээр админ хэний төлбөр болохыг таньна.
 */
export const BANK_ACCOUNTS = [
  { bank: "Хаан банк", number: "5000 1234 5678", holder: "ХАННА ТРЭЙД ХХК" },
  { bank: "Голомт банк", number: "1234 5678 9012", holder: "ХАННА ТРЭЙД ХХК" },
] as const;

/**
 * НҮҮР ХУУДАСНЫ ГОЛ ЗУРАГ.
 *
 * Өөрийн зургаа тавихдаа:
 *   1. Зургаа `public/images/hero.jpg` нэрээр хадгална
 *   2. Доорх `image`-ийг "/images/hero.jpg" болгож солино
 *
 * Facebook, Instagram зэргийн шууд холбоос ашиглаж БОЛОХГҮЙ —
 * тэдгээр хаяг хэдхэн хоногийн дараа хүчингүй болж, зураг алга болно.
 * Зураг нь 3:4 харьцаатай (жишээ нь 1536×2048) байвал хамгийн зөв.
 */
export const HERO = {
  // Зургаа `public/images/` хавтсанд хийж, эндээс замыг нь заана.
  // Замд `public` гэдэг үгийг БИЧИХГҮЙ — "/images/..." гэж эхэлнэ.
  image: "/images/hero.jpg",
  alt: "Намрын шинэ цуглуулга",
} as const;
