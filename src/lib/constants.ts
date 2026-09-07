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

/** Насанд хүрэгчдийн үсэгтэй размерууд */
export const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/**
 * ХҮҮХДИЙН размерууд — өндрөөр (см).
 * SIZE_GUIDE хүснэгттэй ижил дараалалтай байх ёстой.
 */
export const KIDS_SIZES = [
  "90",
  "100",
  "110",
  "120",
  "130",
  "140",
  "150",
  "160",
] as const;

/** Барааны размерууд — хоёуланг нь нэгтгэсэн */
export const SIZES = [...LETTER_SIZES, ...KIDS_SIZES] as const;
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
/*
  QPay-г хассан (2026-09). Хуучин захиалгууд өгөгдлийн санд үлдсэн тул
  Prisma-гийн `PaymentMethod` enum дотор QPAY хэвээр байгаа — гэхдээ
  энд байхгүй тул ШИНЭ захиалгад сонгогдох боломжгүй.
*/
export const PAYMENT_METHODS = [
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
 * Размерын заавар — ХҮҮХДИЙН хувцас.
 *
 * Размер нь ӨНДРӨӨР (см) илэрхийлэгдэнэ. Жишээ нь 110 гэдэг нь
 * 110 см орчим өндөртэй хүүхдэд тохирно гэсэн үг — насны багана
 * нь зөвхөн ойролцоо чиглүүлэг.
 *
 * Дэлгэрэнгүй хуудасны "Размерын заавар" таб дээр хүснэгт болж харагдана.
 */
export const SIZE_GUIDE = {
  columns: ["Размер (см)", "Санамж нас"],
  rows: [
    ["90", "2-3 нас"],
    ["100", "3-4 нас"],
    ["110", "4-5 нас"],
    ["120", "5-6 нас"],
    ["130", "6-7 нас"],
    ["140", "8-9 нас"],
    ["150", "10-11 нас"],
    ["160", "12-13 нас"],
  ],
  note: "Нас нь ойролцоо бөгөөд хүүхэд бүрээр өөр байж болно. Хүүхдийнхээ ӨНДРИЙГ хэмжиж, түүнд хамгийн ойр размерыг сонгохыг зөвлөж байна.",
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
