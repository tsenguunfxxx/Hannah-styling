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
 * Зөвлөмж: ДӨРВӨЛЖИН зураг (1:1) хэрэглэнэ. Өөр харьцаатай бол
 * дунд хэсгээс нь автоматаар тайрч авна.
 */
const GALLERY = [
  {
    src: "https://scontent.fuln2-2.fna.fbcdn.net/v/t39.30808-6/718092765_1504187574744394_5973026603654642363_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=J3OlTath9YMQ7kNvwEJnnYR&_nc_oc=AdqyPc4jW6FP9X2PE31AwPpUT6RZCNKHUbD3u2mQhCBOytqClVq_zRXSLXIg_B3R9Vc&_nc_zt=23&_nc_ht=scontent.fuln2-2.fna&_nc_gid=Wrr03rBgEbzrEPS-gApxGw&_nc_ss=7b2a8&oh=00_AQHt57afBR5H5-Ec3psg1fFPpxJ78qUkgW43A4J0TibNDA&oe=6A96FDA2",
    alt: "White dress",
  },
  {
    src: "https://scontent.fuln2-2.fna.fbcdn.net/v/t39.30808-6/711680068_1498871268609358_6893915976083333718_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=yYlbKRP1jdoQ7kNvwEG6YNd&_nc_oc=AdrOCiBh4YgckoxdLGRwewRFUmOY_j7Dal4qFrl45VsCnLN0OYtN_cJRkNitwkEGWYA&_nc_zt=23&_nc_ht=scontent.fuln2-2.fna&_nc_gid=Z7eMgeFkqfXkvfCkVixE7A&_nc_ss=7b2a8&oh=00_AQHJsvmFBDbTbmBiegviHBHhre-l_nBNVqXBMmsEG7dfrw&oe=6A9721D5",
    alt: "",
  },
  {
    src: "https://scontent.fuln8-1.fna.fbcdn.net/v/t39.30808-6/711695804_1498851465278005_8907389330240126899_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=YvZTiEKdhtgQ7kNvwG58qCJ&_nc_oc=AdpHS7n98B-c_qtUjsmXomuv2jtmXFQhzuYfbbIIZFmwUSq8gwsZ009Osd1UCJmlf-Y&_nc_zt=23&_nc_ht=scontent.fuln8-1.fna&_nc_gid=ndWDdwbpwwgdKu7woKD18w&_nc_ss=7b2a8&oh=00_AQFW53hjFn5rY87kEUKtl4ihbR6Sc3xlPwyVgpSxZoYKXA&oe=6A971325",
    alt: "",
  },
  {
    src: "https://scontent.fuln2-2.fna.fbcdn.net/v/t39.30808-6/670546133_1459193032577182_4658545671978363115_n.jpg?stp=dst-jpg_tt6&cstp=mx858x960&ctp=s858x960&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=IABr4VvvEPoQ7kNvwF6fMDb&_nc_oc=AdpDFBG_RjMowDPGNNPyOxGLhGDgIN87Jc11C01kzpHM3aEo8_a6PxByGA7QsqsjVXw&_nc_zt=23&_nc_ht=scontent.fuln2-2.fna&_nc_gid=Jx7l3aeufwsLF_1Hj2EAkg&_nc_ss=7b2a8&oh=00_AQGZrdJbdpHCJvpnFQgNxDrdT9BP07w1baksvhKTrQ-mLw&oe=6A97020C",
    alt: "",
  },
  {
    src: "https://scontent.fuln8-1.fna.fbcdn.net/v/t39.30808-6/539153181_1278483083981512_4856761292269301832_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s1366x2048&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=72vZEbkyFh0Q7kNvwHwPBkT&_nc_oc=AdoqzPXWlNddfxlD9yAV7YUEhcz7MtDuU1OlNWG0XcGYV0vwKI7XgmBucsbZKuFAzFo&_nc_zt=23&_nc_ht=scontent.fuln8-1.fna&_nc_gid=UjhifUSSv-OAcv3dLRDa6w&_nc_ss=7b2a8&oh=00_AQFuoYgUnmBN2McIW6_JmG2sKiyGOJeeQv7N9uLd_dRNKA&oe=6A972BA5",
    alt: "",
  },
  {
    src: "https://scontent.fuln2-2.fna.fbcdn.net/v/t39.30808-6/539864120_1278483043981516_8310629314791651113_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s1366x2048&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=E_-IMtb932sQ7kNvwEKRUdr&_nc_oc=AdoA_ePxt1jcbaSo8kMhdHW7577O8WIvA4dwlaEGPm8qnMr5ryGOZJ9BmuYzTnd3CJ8&_nc_zt=23&_nc_ht=scontent.fuln2-2.fna&_nc_gid=ESJcS_LRM4966VI5bZLkrA&_nc_ss=7b2a8&oh=00_AQG9aCRecOW6Tn1Zx6dE8WuEYorfmu7kVM1BlVmnd8MEVw&oe=6A972288",
    alt: "",
  },
];

/** Instagram маягийн зургийн хэсэг */
export function Gallery() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-shop mb-10 text-center lg:mb-12">
        {/*
          Хоёр өөр жинтэй үг: "HANNAH" тод, "STYLING" нимгэн.
          Нэг фонтоор ялгаа гаргах хамгийн цэвэр арга.
        */}
        <h2 className="font-display text-3xl uppercase tracking-label sm:text-4xl">
          <span className="font-medium">Hannah</span>{" "}
          <span className="font-light text-graphite">Styling</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        {GALLERY.map((photo) => (
          <div
            key={photo.src}
            className="group relative aspect-square overflow-hidden bg-sand"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className=" object-fill object-cover transition-transform duration-700 group-hover:scale-110 "
            />

            {/* Хулгана дээр очиход бага зэрэг бараантаж, зураг тодрон гарна */}
            <span
              aria-hidden
              className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
