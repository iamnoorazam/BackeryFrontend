import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useRemoveFromCart, useUpdateCartQuantity } from "@/hooks/useCart";

const CartItem = ({ item }) => {
  const remove = useRemoveFromCart();
  const updateQty = useUpdateCartQuantity();
  const [localQty, setLocalQty] = useState(item.quantity);

  const handleUpdate = (delta) => {
    const newQty = Math.max(1, localQty + delta);
    setLocalQty(newQty);
    updateQty.mutate({ productId: item.product._id, quantity: newQty });
  };

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0 animate-fade-up group">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 shadow-sm">
        <img
          src={item.product?.images?.[0] || "https://placehold.co/80x80?text=Item"}
          alt={item.product?.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-foreground text-sm leading-tight truncate">
              {item.product?.name}
            </p>
            <button
              onClick={() => remove.mutate(item.product._id)}
              className="p-1 rounded-lg text-muted-foreground/60 hover:text-danger hover:bg-danger-subtle transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {item.variant && (
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">{item.variant}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => handleUpdate(-1)}
              disabled={localQty <= 1}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-sm font-bold text-foreground">{localQty}</span>
            <button
              onClick={() => handleUpdate(1)}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-foreground">
            {formatPrice(item.price * localQty)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
