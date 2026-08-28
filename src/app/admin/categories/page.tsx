import { getAdminCategories } from "@/lib/queries/admin/category.query";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Ангилал" };

/**
 * АДМИН — АНГИЛАЛ.
 *
 * Ангилал бол хоёр түвшинтэй мод: "Эмэгтэй" › "Даашинз".
 * Дэд ангилал дотор дахин дэд ангилал үүсгэхийг зөвшөөрөхгүй —
 * цэс болон шүүлтүүр ойлгомжтой хэвээр байх ёстой.
 */
export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  const totalChildren = categories.reduce(
    (sum, parent) => sum + parent.children.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="label text-graphite">
          {categories.length} үндсэн · {totalChildren} дэд ангилал
        </p>
        <h1 className="mt-2 font-display text-2xl font-medium uppercase tracking-label">
          Ангилал
        </h1>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
