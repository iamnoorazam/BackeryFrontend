import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-stone-900 text-white hover:bg-stone-800 shadow-sm hover:shadow-md active:scale-[0.97]",
        secondary: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md active:scale-[0.97]",
        outline: "border-2 border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 active:scale-[0.97]",
        ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.97]",
        link: "text-orange-600 underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md hover:shadow-lg hover:from-orange-700 hover:to-amber-600 active:scale-[0.97]",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-lg gap-1.5",
        md: "h-10 px-5 text-sm rounded-xl gap-2",
        lg: "h-12 px-7 text-sm rounded-xl gap-2",
        xl: "h-14 px-8 text-base rounded-2xl gap-2.5",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
