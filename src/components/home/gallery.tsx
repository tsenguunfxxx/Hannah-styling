import Image from "next/image";

/**
 * ⬇️ ЗУРГАА ЭНД СОЛИНО ⬇️
 *
 * `src` — зургийн зам. Хоёр хэлбэр байна:
 *
 *   1. ӨӨРИЙН ФАЙЛ (хамгийн хялбар, зөвлөж байна)
 *      Зургаа `public/images/gallery/` хавтсанд хийгээд
 *      "/images/gallery/файлын-нэр.jpg" гэж бичнэ.
 *
 *   2. ИНТЕРНЭТИЙН ХАЯГ
 *      Бүтэн https:// хаягийг бичнэ. Гэхдээ тухайн хаягийн
 *      домэйныг `next.config.ts` доторх `remotePatterns`-д
 *      нэмсэн байх ЁСТОЙ. Үгүй бол зураг гарахгүй.
 *
 * `alt` — зураг ачаалагдаагүй үед харагдах бичиг. Google хайлтад
 *         ч ашиглагддаг тул юуны зураг болохыг товч бичих нь зүйтэй.
 *
 * Зургийн тоог нэмж, хасаж болно — байрлал нь өөрөө тохирно.
 * Хамгийн тохиромжтой нь 6 ширхэг (том дэлгэцэнд нэг мөрөнд багтана).
 *
 * Зөвлөмж: БОСОО зураг (3:4) хэрэглэнэ — жишээ нь 900×1200.
 * Өөр харьцаатай бол дунд хэсгээс нь автоматаар тайрч авна.
 */
const GALLERY = [
  { src: "/images/gallery/1.jpg", alt: "Цагаан торон даашинз" },
  { src: "/images/gallery/2.jpg", alt: "Хатгамалтай цагаан даашинз" },
  { src: "/images/gallery/3.jpg", alt: "Хормойтой цагаан даашинз" },
  {
    src: "/images/gallery/4.jpg",
    alt: "Цайвар саарал хантааз, урт ханцуйтай цамц",
  },
  { src: "/images/gallery/5.jpg", alt: "Хүрэн ноосон хос" },
  { src: "/images/gallery/6.jpg", alt: "Хүрэн гадуур цув" },
];

/**
 * Lookbook — хажуу тийш ТАСРАЛТГҮЙ гүйх зургийн зурвас.
 *
 * Сүүлийн зураг өнгөрөхөд эхний зураг ард нь шууд үргэлжилнэ —
 * эхлэл, төгсгөлгүй. Үүнийг ижил хоёр жагсаалт зэрэгцүүлж, зурвасыг
 * яг талаар нь шилжүүлэх замаар хийсэн (globals.css доторх
 * `marquee-track`-ийг үзнэ үү).
 */
export function Gallery() {
  return (
    // bg-bone = хуудасны үндсэн дэвсгэртэй ЯГ ижил өнгө (#f2f1ed) —
    // энэ хэсэг тусдаа хайрцаг мэт биш, хуудастай уусна.
    // Дээд ч, доод ч padding байхгүй.
    // Дээрээс: өмнөх барааны хэсгийн доод зай хангалттай.
    // Доороос: footer өөрөө `mt-24` зайтай тул давхарлавал хоосон зурвас үүснэ.
    <section className="bg-bone">
      {/* Ирмэгээс ирмэг хүртэл — хоёр талд нь зураг таслагдан үргэлжилнэ */}
      <div className="marquee overflow-hidden">
        <div className="marquee-track">
          <PhotoRow />
          {/*
            Хоёр дахь хувилбар нь зөвхөн нүдэнд зориулагдсан давталт.
            Дэлгэц уншигч программд хоёр удаа уншигдах шаардлагагүй тул нуулаа.
          */}
          <PhotoRow ariaHidden />
        </div>
      </div>
    </section>
  );
}

/**
 * Нэг бүтэн эргэлтийн зургууд.
 *
 * Зайг `gap` биш `margin-right`-ээр өгсөн — gap ашиглавал зурвасын
 * нийт өргөн тэгш хуваагдахгүй тул давталт бүрд зураг гулсана.
 */
function PhotoRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul className="flex" aria-hidden={ariaHidden}>
      {GALLERY.map((photo) => (
        <li
          key={photo.src}
          className="relative mr-4 aspect-3/4 w-56 shrink-0 overflow-hidden bg-sand sm:mr-6 sm:w-72 lg:mr-8 lg:w-80"
        >
          <Image
            src={photo.src}
            alt={ariaHidden ? "" : photo.alt}
            fill
            sizes="(max-width: 640px) 224px, (max-width: 1024px) 288px, 320px"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
