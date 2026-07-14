import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = ({ className, ...props }) => (
  <LabelPrimitive.Root
    className={cn(
      "text-sm font-semibold text-stone-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
);

export { Label };
