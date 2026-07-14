import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const Spinner = ({ className, size = "md" }) => {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <Loader2
      className={cn(
        "animate-spin text-orange-500",
        sizes[size],
        className
      )}
    />
  );
};

export default Spinner;
