import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-xl bg-stone-100 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
      className
    )}
    {...props}
  />
);

export { Skeleton };
