import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 placeholder:text-stone-400",
      "transition-all duration-200",
      "focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
