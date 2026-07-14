import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/molecules/ProductCard";
import EmptyState from "@/components/atoms/EmptyState";

const ProductCardSkeleton = ({ index = 0 }) => (
  <div
    className="rounded-2xl border border-stone-200 overflow-hidden animate-fade-up"
    style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
  >
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
      <Skeleton className="h-5 w-3/4 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  </div>
);

const ProductGrid = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} index={i} />)}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <EmptyState
        icon="🍽️"
        title="No products found"
        description="Try changing your search or filters."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} staggerIndex={index} />
      ))}
    </div>
  );
};

export default ProductGrid;
