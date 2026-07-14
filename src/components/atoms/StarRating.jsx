import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const StarRating = ({ rating, max = 5, size = 16, interactive = false, onChange, showValue = false }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={cn(
          "transition-all duration-150",
          i < rating
            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
            : "text-stone-200",
          interactive && "cursor-pointer hover:fill-amber-400 hover:text-amber-400 hover:scale-110 active:scale-90"
        )}
        onClick={() => interactive && onChange?.(i + 1)}
      />
    ))}
    {showValue && (
      <span className="ml-1.5 text-xs font-semibold text-stone-600">{rating.toFixed(1)}</span>
    )}
  </div>
);

export default StarRating;
