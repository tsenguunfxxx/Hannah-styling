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
    <section className="relative lg:grid lg:grid-cols-2">
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
      <div className="absolute inset-0 bg-sand lg:relative lg:order-last lg:aspect-3/4">
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

      {/* Текст */}
      <div className="relative flex min-h-[88svh] flex-col justify-end px-5 pb-16 sm:px-10 lg:min-h-0 lg:justify-center lg:px-14 lg:py-20 xl:px-20">
        <p className="label text-bone/70 lg:text-graphite">elegant babies</p>

        <h1 className="mt-5 font-display text-4xl leading-[1.1] font-medium uppercase tracking-label text-bone sm:text-5xl lg:text-ink xl:text-6xl">
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
