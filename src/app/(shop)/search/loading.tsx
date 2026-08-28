import { PageHeaderSkeleton } from "@/components/shared/skeletons";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

export default function SearchLoading() {
  return (
    <div className="container-shop py-12 lg:py-16">
      <PageHeaderSkeleton width="20rem" />
      <div className="mt-10">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
