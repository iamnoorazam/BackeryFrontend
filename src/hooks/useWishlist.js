import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/api/wishlist.api";
import { useAuth } from "@/store/authStore";

const enabledFor = (user, isLoggedIn) => isLoggedIn && user?.role === "customer";

// Full saved-product list for the Wishlist page.
export const useWishlist = () => {
  const { user, isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.get().then((r) => r.data.data),
    enabled: enabledFor(user, isLoggedIn),
  });
};

// Set of wishlisted product ids, derived from the same query (no extra fetch).
// Guests / non-customers get an empty set so hearts render "unsaved".
export const useWishlistIds = () => {
  const { user, isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.get().then((r) => r.data.data),
    enabled: enabledFor(user, isLoggedIn),
    select: (data) => new Set((data?.products || []).map((p) => p._id)),
  });
};

// Toggle a product, optimistically flipping it in the cached wishlist so the
// heart responds instantly. Pass the full product so it can be inserted.
export const useToggleWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product) => wishlistApi.toggle(product._id).then((r) => r.data.data),
    onMutate: async (product) => {
      await qc.cancelQueries({ queryKey: ["wishlist"] });
      const previous = qc.getQueryData(["wishlist"]);
      qc.setQueryData(["wishlist"], (old) => {
        const products = old?.products || [];
        const exists = products.some((p) => p._id === product._id);
        const next = exists
          ? products.filter((p) => p._id !== product._id)
          : [product, ...products];
        return { ...(old || {}), products: next, count: next.length };
      });
      return { previous };
    },
    onError: (_err, _product, ctx) => {
      if (ctx?.previous) qc.setQueryData(["wishlist"], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
};
