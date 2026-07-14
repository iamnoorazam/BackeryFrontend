import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in", className)}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const SheetContent = forwardRef(({ className, children, side = "right", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(
        "fixed z-50 bg-white shadow-modal flex flex-col",
        side === "right" && "inset-y-0 right-0 w-full max-w-sm animate-slide-in-right rounded-l-2xl",
        side === "left" && "inset-y-0 left-0 w-72 animate-slide-in-right rounded-r-2xl",
        className
      )}
      {...props}
    >
      {children}
      <SheetClose className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all">
        <X className="h-5 w-5" />
      </SheetClose>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-5 pb-0", className)} {...props} />
);

const SheetTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-bold text-stone-900", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };
