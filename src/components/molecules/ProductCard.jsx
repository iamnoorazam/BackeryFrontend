import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingBag, Plus, Minus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/store/authStore";
import { useAddToCart } from "@/hooks/useCart";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";

const ProductCard = ({ product, staggerIndex = 0 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasVariants = product?.variants?.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(null);
  useMemo(() => {
    if (hasVariants && !selectedVariant) setSelectedVariant(product.variants[0]);
  }, [product, hasVariants, selectedVariant]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayOrigPrice = selectedVariant?.originalPrice ?? product?.originalPrice;
  const discount = displayOrigPrice > displayPrice
    ? Math.round((1 - displayPrice / displayOrigPrice) * 100)
    : product?.discount || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuthDialog(true); return; }
    if (user.role !== "customer") { toast({ title: "Only customers can add to cart", variant: "destructive" }); return; }
    addToCart.mutate(
      { productId: product._id, quantity: qty, variant: selectedVariant?.name, price: displayPrice },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
          toast({ title: `Added ${qty} × ${product.name} to cart!` });
        },
        onError: () => toast({ title: "Failed to add", variant: "destructive" }),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: staggerIndex * 0.05, ease: "easeOut" }}
    >
      <Link
        to={`/products/${product._id}`}
        className="group block bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-50">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-stone-100 animate-pulse" />
          )}
          <img
            src={product.images?.[0] || "https://placehold.co/600x400?text=Yummy"}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge variant="premium" className="text-[10px] px-2 py-0.5 shadow-lg">
                {discount}% OFF
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="success" className="text-[10px] px-2 py-0.5">
                Best Seller
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 border-0">
                New
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100 sm:opacity-100"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500 scale-110" : "text-stone-500"}`}
            />
          </button>

          {/* Veg/Non-Veg */}
          {product.isVeg !== undefined && (
            <div className="absolute bottom-2 left-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${product.isVeg ? "border-emerald-500 bg-emerald-50" : "border-red-500 bg-red-50"}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${product.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-2.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              {product.category?.name || "Food"}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-stone-600">
                {product.averageRating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-[10px] text-stone-400">
                ({product.totalReviews || 0})
              </span>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-bold text-stone-900 leading-tight text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-stone-400 line-clamp-1 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variants */}
          {hasVariants && (
            <div className="flex flex-wrap gap-1.5">
              {product.variants.slice(0, 3).map((v) => (
                <button
                  key={v.name}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedVariant(v); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    selectedVariant?.name === v.name
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-stone-200 text-stone-500 hover:border-stone-300"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-stone-900">
                {formatPrice(displayPrice)}
              </span>
              {displayOrigPrice > displayPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(displayOrigPrice)}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="added"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md"
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <button
                    onClick={handleAddToCart}
                    className="w-9 h-9 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white flex items-center justify-center hover:shadow-lg hover:from-orange-700 hover:to-amber-600 transition-all duration-200 active:scale-90"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Link>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Login Required</DialogTitle>
            <DialogDescription className="text-center">
              Please login to add items to your cart.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Button variant="secondary" size="lg" className="w-full" onClick={() => { setShowAuthDialog(false); navigate(`/login?redirect=/products/${product._id}`); }}>
              Login
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => { setShowAuthDialog(false); navigate(`/register?redirect=/products/${product._id}`); }}>
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProductCard;
