"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { HERO } from "@/lib/constants";

/**
 * НҮҮР ХУУДСЫГ НЭЭХ ТОМ ДЭЛГЭЦ.
 *
 * ЮУ БОЛЖ БАЙГАА ВЭ?
 *
 *   Хуудас нээгдмэгц зураг БҮТЭН дэлгэцийг эзэлж, дээр нь
 *   "HANNAH STYLING" гэсэн том бичиг гарна. Доошоо гүйлгэж
 *   эхлэхэд тэр зураг аажмаар ЖИЖГЭРЧ, нүүр хуудасны ердийн
 *   hero зурган дээрээ ЯГ таарч буугаад алга болно. Тэндээс
 *   цааш хуудас өмнөх хэвээрээ ажиллана.
 *
 * ЯАЖ АЖИЛЛАДАГ ВЭ? (FLIP гэдэг арга)
 *
 *   1. Ердийн hero-гийн зураг хаана, ямар хэмжээтэй зогсохыг
 *      хөтчөөс ХЭМЖИЖ авна (`data-hero-image` гэсэн тэмдэгээр олно).
 *   2. Дээр нь давхарласан "нөмрөг" зургийг бүтэн дэлгэцээс тэр
 *      хэмжээ рүү шилжүүлнэ. Гүйлгэлтийн хэдэн хувь явсанаар
 *      шилжилтийн хэдэн хувь болохыг ScrollTrigger хэлж өгнө.
 *   3. 100% дээр хоёр зураг ЯГ давхцаж байгаа тул нөмрөгөө
 *      нуухад хэрэглэгч ямар ч үсрэлт харахгүй.
 *
 * ЯАГААД ДЭЭР НЬ ТУСДАА ЗУРАГ ТАВЬСАН БЭ?
 *
 *   Жинхэнэ hero-гийн зураг нь grid-ийн нэг нүд. Түүнийг
 *   `fixed` болговол багана нурж, хажуугийн текст байрлалаа
 *   алдана. Тиймээс жинхэнэ бүтцэд огт хүрэлгүй, зөвхөн
 *   давхарласан хуулбарыг хөдөлгөв. Зураг ижил хаягтай тул
 *   хөтөч дахин татахгүй — хоёр дахь удаад cache-ээс авна.
 *
 * ХӨДӨЛГӨӨН ХҮСЭХГҮЙ ХҮНД:
 *   `prefers-reduced-motion` асаалттай бол нээх дэлгэцийг огт
 *   үзүүлэхгүй, шууд ердийн хуудсыг харуулна.
 */
export function HeroIntro({ children }: { children: React.ReactNode }) {
  /** Гүйлгэх зай өгөх хоосон блок — өндөр нь нэг дэлгэц */
  const spacerRef = useRef<HTMLDivElement>(null);
  /** Дээр давхарласан бүтэн дэлгэцийн зураг */
  const overlayRef = useRef<HTMLDivElement>(null);
  /** "HANNAH STYLING" бичиг */
  const titleRef = useRef<HTMLDivElement>(null);
  /** Жинхэнэ hero-г багтаасан блок */
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spacer = spacerRef.current;
    const overlay = overlayRef.current;
    const title = titleRef.current;
    const hero = heroRef.current;

    if (!spacer || !overlay || !title || !hero) return;

    // Жинхэнэ hero-гийн зургийн хайрцаг
    const target = hero.querySelector<HTMLElement>("[data-hero-image]");
    if (!target) return;

    /**
     * Нээх дэлгэцийг БҮРЭН цуцалж, хуудсыг ердийн байдалд нь үлдээнэ.
     * Хөдөлгөөн хүсэхгүй байгаа, эсвэл GSAP ачаалагдаагүй үед дуудна.
     * Хоосон блокийг нуух нь ЧУХАЛ — үгүй бол дээр нь нэг дэлгэцийн
     * хоосон зай үлдэнэ.
     */
    const cancel = () => {
      spacer.style.display = "none";
      overlay.style.display = "none";
      overlay.dataset.heroIntro = "off"; // navbar ердийн байдалдаа
      hero.style.opacity = "1";
      target.style.opacity = "1";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancel();
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (disposed) return;

        gsap.registerPlugin(ScrollTrigger);

        const clamp = gsap.utils.clamp(0, 1);

        /**
         * Гүйлгэлтийн `progress` (0 → 1) утгыг дэлгэц дээр буулгана.
         */
        const apply = (progress: number) => {
          const p = clamp(progress);
          const done = p >= 1;

          /*
            ⚠️ БАЙРЛАЛЫГ ҮРГЭЛЖ ТООЦНО — дууссан үед ч гэсэн.

            Эхэндээ "дууссан бол шууд буц" гэж бичсэн байв. Гэтэл
            хулганы дугуйг нэг эргүүлэхэд гүйлгэлт 100 орчим пиксель
            ҮСРЭНЭ. Тэгэхээр сүүлчийн тооцоолол 0.85 дээр зогсоод,
            дараагийн кадрт шууд нуугдана — жижгэрч дуусаагүй зураг
            гэнэт алга болж, нүд гүйцэхээр цохилно.

            Одоо p=1 дээр ч байрлалыг тооцох тул нуугдах мөчид нөмрөг
            жинхэнэ зурагтайгаа ЯГ давхцаж байдаг. Хэдэн кадр хоцорсон
            ч ялгаа мэдрэгдэхгүй.
          */
          const rect = target.getBoundingClientRect();
          const remaining = (1 - p) * spacer.offsetHeight;
          const endTop = rect.top - remaining;

          const vw = document.documentElement.clientWidth;
          const vh = window.innerHeight;

          // p=0 → бүтэн дэлгэц, p=1 → яг жинхэнэ зургийн хайрцаг
          gsap.set(overlay, {
            top: endTop * p,
            left: rect.left * p,
            width: vw + (rect.width - vw) * p,
            height: vh + (rect.height - vh) * p,
            right: "auto",
            bottom: "auto",
          });

          // Бичиг эхний хагаст нь бүдгэрч, өчүүхэн ойртоно
          gsap.set(title, {
            opacity: 1 - clamp(p / 0.55),
            scale: 1 - 0.1 * p,
          });

          /*
            Байрлал тохирсны ДАРАА л нуулгана. `visibility` ашигласан
            нь санаатай: `display:none` болговол дараа нь буцаж дээш
            гүйлгэхэд хэмжилт дахин хийгдэж, нэг кадр чичрэх магадлалтай.
          */
          overlay.style.visibility = done ? "hidden" : "visible";
          target.style.opacity = done ? "1" : "0";

          /*
            Navbar-ын өнгийг энэ тэмдэг шийднэ. Нээх дэлгэц дээр
            тунгалаг, дуусмагц ердийн цайвар. Дүрэм нь `globals.css`-д.
          */
          overlay.dataset.heroIntro = done ? "off" : "on";

          /*
            Жинхэнэ hero (текст, товчнууд) нь нөмрөг жижгэрч эхэлсний
            дараа аажим гарч ирнэ. 0.3-аас өмнө харагдвал бүтэн
            дэлгэцийн зургийн ард сүүдэр мэт дүнсийж мэдэнэ.
          */
          hero.style.opacity = String(clamp((p - 0.3) / 0.45));
        };

        const trigger = ScrollTrigger.create({
          // Тоо өгвөл ScrollTrigger үүнийг ШУУД гүйлгэлтийн байрлал
          // (px) гэж ойлгоно. Наалдамхай толгой хэсэг нь хэмжилтэд
          // нөлөөлөхгүй тул trigger элемент ашиглахаас илүү нягт.
          start: 0,
          end: () => spacer.offsetHeight,
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });

        cleanup = () => trigger.kill();
      } catch {
        // GSAP ирээгүй бол хуудас эвдрэхгүй — нээх дэлгэцийг л алгасна
        cancel();
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <>
      {/*
        Гүйлгэх зай. Өөрөө юу ч харуулахгүй — зөвхөн нэг дэлгэцийн
        өндөртэй хоосон зай өгч, тэр зайг гүйх хугацаанд шилжилт
        явагдана. Гүйж өнгөрсний дараа дээр нь үлдэх тул хуудасны
        харагдах байдалд нөлөөлөхгүй.
      */}
      <div ref={spacerRef} aria-hidden className="h-svh" />

      {/*
        z-30 — наалдамхай толгой хэсэг (z-40) ДЭЭР нь үлдэнэ.
        Ингэснээр цэс нь нээх дэлгэцэн дээр ч ажиллана.
      */}
      <div
        ref={overlayRef}
        aria-hidden
        data-hero-intro="on"
        /*
          Дэвсгэр нь зургийн өөрийнх нь бараан бор өнгө (#3c2313 —
          зургийн хажуу захаас хэмжсэн). Зураг ачаалагдаж амжаагүй
          эхний агшинд ч дэлгэц зурагтайгаа ижил өнгөтэй байна.
        */
        className="fixed inset-0 z-30 overflow-hidden bg-[#3c2313]"
      >
        {/*
          БҮДЭГ ДЭВСГЭР (зөвхөн өргөн дэлгэцэнд).

          Доор бүтэн зургийг `object-contain`-аар тавина — өөрөөр
          хэлбэл зураг БҮХЭЛДЭЭ харагдана, толгой нь таарахгүй.
          Гэхдээ зураг босоо (3:4), дэлгэц хэвтээ тул хоёр хажуудаа
          хоосон зай үлдэнэ. Тэр зайг ижил зургийн бүдгэрүүлсэн,
          томсгосон хуулбараар дүүргэнэ — өнгө нь өндөр бүрт
          таарах тул зааг мэдэгдэхгүй.

          `sizes="64px"` — бүдгэрсэн зурагт нарийвчлал хэрэггүй.
          Хөтөч хамгийн жижиг хувилбарыг нь татна (хэдхэн KB).
        */}
        <Image
          src={HERO.image}
          alt=""
          fill
          priority
          sizes="64px"
          quality={30}
          className="hidden scale-110 object-cover blur-2xl brightness-[0.5] lg:block"
        />

        {/*
          БҮТЭН ЗУРАГ.

          `lg:object-contain` — өргөн дэлгэцэнд зураг бүхэлдээ.
          Утсанд `object-cover` хэвээр: утасны дэлгэц өөрөө босоо тул
          тайралт бага, гол нь ЖИНХЭНЭ hero-гийн зураг мөн `cover`
          учраас шилжилт дуусах мөчид хоёулаа ЯГ адилхан харагдана.
          (Өргөн дэлгэцэнд төгсгөлийн хайрцаг яг 3:4 болдог тул
          `contain` ба `cover` хоёр ижил үр дүн өгнө.)
        */}
        <Image
          src={HERO.image}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover lg:object-contain"
        />

        {/*
          Бичиг уншигдахуйц байхын тулд зургийг бараатуулна.
          Дунд хэсэг нь илүү бараан — цагаан бичиг яг тэнд таарна.
        */}
        {/*
          Жигд, зөөлөн бүдгэрүүлэлт — нэр уншигдахад хангалттай,
          зургийг булингартуулахгүй. Өмнө нь доод талыг нь хэт
          бараатгасан тул загвар өөрөө алга болж байлаа.
        */}
        <span aria-hidden className="absolute inset-0 bg-ink/35" />

        {/*
          Доод зах дээр л нэмж бараатгана — жижиг мөр тэнд суух тул.
          Зургийн гол хэсэгт хүрэхгүй.
        */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink/80 to-transparent"
        />

        {/*
          БРЭНДИЙН НЭР.

          Cormorant Garamond — нимгэн, өндөр ялгаралтай serif.
          Загварын сэтгүүлийн нүүр шиг харагдуулахын тулд:
            • `font-light` — нарийн зурвастай, эрхэмсэг
            • `tracking-[0.08em]` — үсэг хооронд амьсгал өгнө
            • доогуур нь үсээр татсан зураас, дараа нь жижиг мөр
          Доод хоёр нь нэрийг "тэмдэг" болгож, зүгээр бичиг
          биш логон шиг унших боломж олгоно.
        */}
        <div ref={titleRef} className="absolute inset-0">
          {/* Нэр — дэлгэцийн яг голд */}
          <div className="flex h-full items-center justify-center px-5">
            <p className="text-center font-editorial text-[13vw] leading-[0.92] font-light uppercase tracking-[0.08em] text-bone sm:text-[11vw]">
              Hannah Styling
            </p>
          </div>

          {/*
            Зураас ба жижиг мөр нь ДООД ТАЛД.

            Эхэндээ нэрийн яг доор тавьсан байв. Гэтэл тэр хэсэгт
            загварын цагаан даашинз таарч, цагаан бичиг дээр нь
            уусаад алга болдог байлаа. Доод зах нь бараан тул
            уншигдана — мөн нэр илүү чөлөөтэй амьсгалж байна.
          */}
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4 sm:bottom-12">
            <span aria-hidden className="h-px w-20 bg-bone/50 sm:w-28" />
            <p className="label text-bone/80">elegant babies</p>
          </div>
        </div>
      </div>

      <div ref={heroRef}>{children}</div>
    </>
  );
}
