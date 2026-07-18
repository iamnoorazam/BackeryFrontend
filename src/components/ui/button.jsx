import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap pressable",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background hover:opacity-90 shadow-sm hover:shadow-md",
        secondary:
          "bg-primary text-primary-foreground hover:brightness-105 shadow-sm hover:shadow-md",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-foreground/20",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        subtle: "bg-muted text-foreground hover:bg-surface-3",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-105 shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white shadow-md shadow-[#D2691E]/20 hover:shadow-lg hover:shadow-[#D2691E]/30 hover:from-[#A0522D] hover:to-[#D2691E]",
        silk:
          "bg-gradient-to-r from-[#9E2B5E] to-[#E58FB0] text-white shadow-md shadow-[#9E2B5E]/20 hover:shadow-lg hover:shadow-[#9E2B5E]/30 hover:from-[#7B2C5E] hover:to-[#9E2B5E]",
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
