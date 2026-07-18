import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }) => (
  <div className={cn("skeleton-shimmer rounded-xl", className)} {...props} />
);

export { Skeleton };
