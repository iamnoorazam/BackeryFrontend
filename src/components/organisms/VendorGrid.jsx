import { Skeleton } from "@/components/ui/skeleton";
import VendorCard from "@/components/molecules/VendorCard";
import EmptyState from "@/components/atoms/EmptyState";

const VendorCardSkeleton = ({ index = 0 }) => (
  <div
    className="rounded-2xl border border-border overflow-hidden animate-fade-up"
    style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
  >
    <Skeleton className="h-40 w-full" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-10 rounded" />
      </div>
      <Skeleton className="h-3 w-40 rounded" />
      <div className="flex gap-3 pt-1">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
    </div>
  </div>
);

const VendorGrid = ({ vendors, isLoading, emptyTitle = "No stores found", emptyDescription = "Try changing your filters or location." }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {Array.from({ length: 6 }).map((_, i) => <VendorCardSkeleton key={i} index={i} />)}
      </div>
    );
  }

  if (!vendors?.length) {
    return <EmptyState icon="🏪" title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {vendors.map((vendor, index) => (
        <VendorCard key={vendor._id} vendor={vendor} staggerIndex={index} />
      ))}
    </div>
  );
};

export default VendorGrid;
