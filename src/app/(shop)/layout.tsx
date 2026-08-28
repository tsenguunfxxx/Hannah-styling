import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Дэлгүүрийн бүх хуудсанд хамаарах хүрээ.
 * Navbar болон Footer нэг л удаа энд бичигдэж, доорх бүх хуудсанд харагдана.
 */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
