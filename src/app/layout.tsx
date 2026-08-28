import type { Metadata, Viewport } from "next";
import { Jost, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/**
 * Jost  — геометр хэлбэртэй, fashion брэндэд тохирсон. Гарчиг, лого, товчинд.
 * Inter — уншихад амар. Энгийн текст, үнэ, форминд.
 */
const jost = Jost({
  variable: "--font-heading-face",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"], // Монгол кирилл үсэг зөв гарна
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HANNAH — Хувцасны онлайн дэлгүүр",
    template: "%s | HANNAH",
  },
  description:
    "Өдөр тутмын premium хувцас. Шинэ цуглуулга, чанартай материал, хурдан хүргэлт.",
};

/**
 * Утасны дэлгэцийн тохиргоо.
 *
 * `maximumScale` тавихгүй — хараа муутай хүн хуудсыг томсгож
 * чаддаг байх ёстой. Зарим сайт үүнийг хааж хүртээмжийг алддаг.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2f1ed",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="mn"
      className={`${jost.variable} ${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
