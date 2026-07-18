import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const Avatar = ({ className, ...props }) => (
  <AvatarPrimitive.Root
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white",
      className
    )}
    {...props}
  />
);

const AvatarImage = ({ className, ...props }) => (
  <AvatarPrimitive.Image className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
);

const AvatarFallback = ({ className, ...props }) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A04F] text-white text-sm font-bold",
      className
    )}
    {...props}
  />
);

export { Avatar, AvatarImage, AvatarFallback };
