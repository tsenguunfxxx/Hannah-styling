import Image from "next/image";
import Link from "next/link";

import { HERO } from "@/lib/constants";

/**
 * Нүүр хуудасны эхний дэлгэц.
 *
 * ХОЁР ӨӨР БАЙРЛАЛ:
 *
 *   Утас / таблет (< lg)
 *     Зураг бүтэн дэлгэцийг дүүргэж, текст нь ДЭЭР нь давхарлана.
 *     Жижиг дэлгэцэнд зураг, текст хоёрыг дээш доош нь өрвөл
 *     эхний харцанд аль аль нь бүтнээр харагдахгүй.
 *
 *   Компьютер (lg+)
 *     Зүүн талд текст, баруун талд зураг. Зургийн багана нь ЯГ 3:4
 *     харьцаатай тул зураг бүхэлдээ, тайрагдалгүй харагдана.
 *
 * Тиймээс өнгө нь ч хоёр янз: зураг дээр цайвар, цагаан дэвсгэр дээр бараан.
 */
export function Hero() {
  return (
    /*
      lg дээр НЭГ ДЭЛГЭЦЭНД ЯГ БАГТАНА.

      Өмнө нь өндөр нь зургийн харьцаанаас (3:4) гардаг байв.
      1280px өргөнтэй дэлгэц дээр багана нь 640px → зураг 853px өндөр
      болж, 800px өндөртэй цонхонд багтахаа больдог. Том дэлгэц дээр
      бүр дордоно: 1920px дээр зураг 1280px өндөр болно.

      Одоо өндрийг нь ДЭЛГЭЦЭЭС гаргана:
        100svh − 5rem (navbar-ийн `h-20`) − 1px (navbar-ийн доод зураас)
      Тэр хоёр тоо `navbar.tsx`-аас гаралтай — тэнд өөрчилвөл эндээ
      бас засна.

      `svh` ашигласан нь санаатай: гар утасны хөтчийн хаяг бичих мөр
      нуугдаж гарахад `vh` үсэрдэг.

      ЯАГААД `h-` БИШ `min-h-` ВЭ?
        Хатуу өндөр өгвөл МАШ НАМХАН цонхон дээр (ж нь 1280×640)
        гарчиг section-оосоо халиад, дээд мөр нь navbar-ийн доогуур
        орж, товч нь доороо гарч зурагдана. `min-h-` бол ердийн
        дэлгэц дээр яг нэг нүүр болж таарна, харин текст үнэхээр
        багтахгүй бол л сунана — давхцахаас гүйлгэх нь дээр.
    */
    <section className="relative lg:grid lg:min-h-[calc(100svh-5rem-1px)] lg:grid-cols-2">
      {/*
        Зураг.
        Утсанд: бүх талбарыг эзэлнэ (absolute inset-0).
        lg дээр: grid-ийн баруун нүд болж, өөрийн харьцаагаараа зогсоно.
      */}
      {/*
        lg дээр `relative` хэвээр үлдэх нь ЧУХАЛ.
        `fill` зураг хамгийн ойрын байрлалтай эцгээ барьдаг —
        энэ div байрлалаа алдвал зураг section-д наалдаж,
        хоёр баганыг гаталж бүтэн өргөнөөр тархана.
      */}
      {/*
        `data-hero-image` — нээх дэлгэцийн зураг ЯГ хаана буух ёстойг
        `hero-intro.tsx` энэ тэмдэгээр олж хэмжинэ. Зөвхөн таних
        тэмдэг тул харагдах байдалд ямар ч нөлөөгүй.
      */}
      {/*
        lg дээр зураг БОСОО ХАВТАН болж, баруун зах руугаа тулна.

        `lg:h-full` — дээрх дэлгэцийн өндрийг дүүргэнэ.
        `lg:aspect-3/4` + `lg:w-auto` + `lg:justify-self-end` — өргөн нь
        одоо өндрөөсөө гарна (өндөр × 3/4). Ингэснээр зураг анхныхаасаа
        жижиг болж, зүүн талдаа амьсгалах зай үлдээнэ.
        `lg:max-w-full` — маш өндөр цонхон дээр зураг багананаасаа
        халихаас сэргийлнэ.
      */}
      <div
        data-hero-image
        className="absolute inset-0 bg-sand lg:relative lg:order-last lg:aspect-3/4 lg:h-full lg:w-auto lg:max-w-full lg:justify-self-end"
      >
        <Image
          src={HERO.image}
          alt={HERO.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={90}
          className="object-cover"
        />

        {/* Зөвхөн утсанд — текст уншигдахуйц байхын тулд доод талд налалт */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10 lg:hidden"
        />
      </div>

      {/*
        Текст.

        `lg:py-10` (өмнө нь `py-20`) — section нь одоо ТОГТСОН өндөртэй
        болсон тул босоо зай нь зөвхөн "хамгийн багадаа энэ зайг үлдээ"
        гэсэн үүрэгтэй. Агуулга голлож байрладаг учир өндөр дэлгэц дээр
        харагдах байдал нь өөрчлөгдөхгүй, харин НАМХАН цонхон дээр
        (жишээ нь 1280×640) текст section-оосоо халихаас сэргийлнэ.
      */}
      <div className="relative flex min-h-[88svh] flex-col justify-end px-5 pb-16 sm:px-10 lg:min-h-0 lg:justify-center lg:px-14 lg:py-10 xl:px-20">
        <p className="label text-bone/70 lg:text-graphite">elegant babies</p>

        <h1 className="mt-5 font-display text-3xl leading-[1.15] font-medium uppercase tracking-label text-bone sm:text-5xl lg:text-ink xl:text-6xl">
          Зөвхөн хамгийн сайн
          <br />
          хамгийн хөөрхөн нь тэдэнд.
        </h1>

        <p className="mt-6 max-w-md text-sm leading-relaxed text-bone lg:text-graphite">
          Цаг хугацаанд элэгдэхгүй загвар, чанартай материал. Өдөр тутмаас
          онцгой мөч хүртэл.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          {/* Товч: зураг дээр цайвар, цагаан дэвсгэр дээр бараан */}
          <Link
            href="/shop"
            className="label bg-bone px-8 py-4 text-ink transition-opacity hover:opacity-85 lg:bg-ink lg:text-bone"
          >
            Shop now
          </Link>

          <Link
            href="/shop?sort=newest"
            className="label border-b border-bone/50 pb-1 text-bone transition-colors hover:border-bone lg:border-line lg:text-ink lg:hover:border-ink"
          >
            Шинэ бараа үзэх
          </Link>
        </div>
      </div>
    </section>
  );
}
