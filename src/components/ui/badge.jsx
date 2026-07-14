import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-stone-900 text-white",
        secondary: "bg-stone-100 text-stone-700",
        outline: "border-2 border-stone-200 text-stone-600",
        premium: "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border border-amber-200",
        danger: "bg-red-50 text-red-700 border border-red-200",
        info: "bg-sky-50 text-sky-700 border border-sky-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Badge = ({ className, variant, ...props }) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };
