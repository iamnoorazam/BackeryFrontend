import { Trash2, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/atoms/StarRating";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/store/authStore";

const ReviewCard = ({ review, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user?._id === review.customer?._id || user?.id === review.customer?._id;

  return (
    <div className="flex gap-4 py-5 border-b border-stone-100 last:border-0 animate-fade-up">
      <Avatar className="w-10 h-10 ring-2 ring-[#D2691E]/20 shrink-0">
        <AvatarFallback>
          {review.customer?.name?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-stone-900 text-sm">{review.customer?.name}</p>
              <span className="text-[10px] text-stone-400">{formatDate(review.createdAt)}</span>
            </div>
            <StarRating rating={review.rating} size={13} />
          </div>
          {isOwner && (
            <button
              onClick={() => onDelete(review._id)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="mt-2 relative">
          <Quote className="h-3.5 w-3.5 text-[#D2691E] absolute -top-0.5 -left-0.5" />
          <p className="text-sm text-stone-600 leading-relaxed pl-5">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
