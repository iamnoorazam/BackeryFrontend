import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/organisms/ProductGrid";
import EmptyState from "@/components/atoms/EmptyState";
import { useWishlist } from "@/hooks/useWishlist";

const Wishlist = () => {
  const { data, isLoading } = useWishlist();
  const products = data?.products || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-8"
    >
      <div className="flex items-center gap-2 mb-1">
        <Heart className="h-6 w-6 fill-red-500 text-red-500" />
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">My Wishlist</h1>
      </div>
      <p className="text-stone-400 text-sm mb-6">
        {products.length ? `${products.length} saved item${products.length > 1 ? "s" : ""}` : "Items you save show up here"}
      </p>

      {!isLoading && !products.length ? (
        <EmptyState
          icon="🤍"
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it for later."
          action={
            <Button variant="premium" asChild>
              <a href="/products">Browse Menu</a>
            </Button>
          }
        />
      ) : (
        <ProductGrid products={products} isLoading={isLoading} />
      )}
    </motion.div>
  );
};

export default Wishlist;
