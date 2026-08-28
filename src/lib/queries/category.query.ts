import { prisma } from "@/lib/prisma";

/** Үндсэн (эцэг) ангиллууд — нүүр хуудасны Categories хэсэгт */
export async function getMainCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: { select: { products: true, children: true } },
    },
  });
}

/** Navbar болон filter-д хэрэгтэй бүх ангилал — модны бүтэцтэй */
export async function getCategoryTree() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export type MainCategory = Awaited<ReturnType<typeof getMainCategories>>[number];
export type CategoryTreeItem = Awaited<ReturnType<typeof getCategoryTree>>[number];
