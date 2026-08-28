import { prisma } from "@/lib/prisma";

/**
 * Админы ангиллын жагсаалт — эцэг, дэд гэсэн модны дарааллаар.
 */
export async function getAdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      sortOrder: true,
      isActive: true,
      parentId: true,
      _count: { select: { products: true, children: true } },
    },
  });

  const parents = categories.filter((c) => !c.parentId);

  // Эцэг бүрийн доор нь хүүхдүүдийг нь жагсаана
  return parents.map((parent) => ({
    ...parent,
    children: categories.filter((c) => c.parentId === parent.id),
  }));
}

export type AdminCategoryNode = Awaited<
  ReturnType<typeof getAdminCategories>
>[number];

export type AdminCategoryChild = AdminCategoryNode["children"][number];
