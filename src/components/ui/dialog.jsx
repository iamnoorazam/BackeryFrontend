import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in", className)}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = forwardRef(({ className, children, fullScreen = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(
        "fixed z-50 bg-popover text-popover-foreground shadow-modal",
        fullScreen
          ? // Edge-to-edge, top-to-bottom — slides down from the top edge.
            "inset-0 h-full w-full max-w-full overflow-hidden rounded-none p-0 animate-slide-down-full"
          : [
              "max-h-[85vh] overflow-y-auto",
              "bottom-0 left-0 right-0 sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto",
              "rounded-t-2xl sm:rounded-2xl",
              "sm:translate-x-[-50%] sm:translate-y-[-50%]",
              "sm:max-w-lg w-full",
              "p-6",
              "animate-slide-up-full sm:animate-scale-in",
            ],
        className
      )}
      {...props}
    >
      {children}
      <DialogClose className="absolute right-4 top-4 z-20 rounded-full p-2 bg-card/70 backdrop-blur text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-all">
        <X className="h-4 w-4" />
      </DialogClose>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);

const DialogTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-bold text-foreground", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose };
