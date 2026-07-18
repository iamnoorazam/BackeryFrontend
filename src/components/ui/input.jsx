import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border-2 border-input bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70",
      "transition-all duration-200",
      "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
