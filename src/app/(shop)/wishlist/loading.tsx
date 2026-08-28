import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function WishlistLoading() {
  return (
    <div className="container-shop py-12 lg:py-16">
      <PageHeaderSkeleton width="18rem" />
      <div className="mt-10">
        <CardGridSkeleton count={4} />
      </div>
    </div>
  );
}
