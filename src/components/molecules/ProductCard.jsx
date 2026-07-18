import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Star, ShoppingBag, Plus, Minus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/store/authStore";
import { useAddToCart } from "@/hooks/useCart";
import { useWishlistIds, useToggleWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";
import { isFashionCategory } from "@/lib/categories";
import { buildBuyNowItem, setBuyNowItem } from "@/lib/buyNow";

const ProductCard = ({ product, staggerIndex = 0 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const addToCart = useAddToCart();
  const { data: wishlistIds } = useWishlistIds();
  const toggleWishlist = useToggleWishlist();
  const wishlisted = wishlistIds?.has(product._id) || false;
  const [qty, setQty] = useState(1);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (user.role !== "customer") {
      toast({ title: "Only customers can save items", variant: "destructive" });
      return;
    }
    toggleWishlist.mutate(product, {
      onError: () => toast({ title: "Failed to update wishlist", variant: "destructive" }),
    });
  };

  const isFashion = isFashionCategory(product?.category?.name);
  const accent = isFashion
    ? {
        text: "group-hover:text-[#9E2B5E]",
        border: "hover:border-[#9E2B5E]/30",
        btn: "from-[#9E2B5E] to-[#E58FB0] hover:from-[#7B2C5E] hover:to-[#9E2B5E]",
        chip: "border-brand-2 bg-brand-2/10 text-brand-2",
      }
    : {
        text: "group-hover:text-[#D2691E]",
        border: "hover:border-[#D2691E]/30",
        btn: "from-[#D2691E] to-[#E8A04F] hover:from-[#A0522D] hover:to-[#D2691E]",
        chip: "border-primary bg-primary/10 text-primary",
      };
  const hasVariants = product?.variants?.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(null);
  useEffect(() => {
    if (hasVariants && !selectedVariant) setSelectedVariant(product.variants[0]);
  }, [product, hasVariants, selectedVariant]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayOrigPrice = selectedVariant?.originalPrice ?? product?.originalPrice;
  const discount =
    displayOrigPrice > displayPrice
      ? Math.round((1 - displayPrice / displayOrigPrice) * 100)
      : product?.discount || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (user.role !== "customer") {
      toast({ title: "Only customers can add to cart", variant: "destructive" });
      return;
    }
    addToCart.mutate(
      {
        productId: product._id,
        quantity: qty,
        variant: selectedVariant?.name,
        price: displayPrice,
      },
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

  // Lightweight pointer-driven 3D tilt (desktop only — touch never fires mousemove).
  const [tilt, setTilt] = useState("");
  const handleTilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt(
      `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`,
    );
  };
  const resetTilt = () => setTilt("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: staggerIndex * 0.05, ease: "easeOut" }}
      style={{ perspective: "1000px" }}
    >
      <div
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
        style={{ transform: tilt || undefined, transition: "transform 0.15s ease-out" }}
        className={`group block bg-card rounded-2xl border border-border/70 overflow-hidden shadow-soft hover:shadow-elevated ${accent.border}`}
      >
        {/* Image → opens quick view */}
        <Link
          to={`/products/${product._id}`}
          state={{ backgroundLocation: location, product }}
          aria-label={`Quick view ${product.name}`}
          className={`relative block overflow-hidden bg-muted ${isFashion ? "aspect-[3/4]" : "aspect-[4/3]"}`}
        >
          {!imgLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
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
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-all shadow-lg opacity-0 group-hover:opacity-100 sm:opacity-100"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"}`}
            />
          </button>

          {/* Veg/Non-Veg (food only) */}
          {!isFashion && product.isVeg !== undefined && (
            <div className="absolute bottom-2 left-2">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-card ${product.isVeg ? "border-emerald-500" : "border-red-500"}`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${product.isVeg ? "bg-emerald-500" : "bg-red-500"}`}
                />
              </div>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-3.5 space-y-2">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 truncate min-w-0">
              {product.category?.name || "Food"}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold text-muted-foreground">
                {product.averageRating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
                ({product.totalReviews || 0})
              </span>
            </div>
          </div>

          {/* Name + description → opens quick view */}
          <Link
            to={`/products/${product._id}`}
            state={{ backgroundLocation: location, product }}
            className="block space-y-2"
          >
            <h3
              className={`font-bold text-foreground leading-tight text-sm line-clamp-2 transition-colors break-words ${accent.text}`}
            >
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed break-words">
                {product.description}
              </p>
            )}
          </Link>

          {/* Variants */}
          {hasVariants && (
            <div className="flex flex-wrap gap-1">
              {product.variants.slice(0, 3).map((v) => (
                <button
                  key={v.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    selectedVariant?.name === v.name
                      ? accent.chip
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-base sm:text-lg font-bold text-foreground truncate">
                {formatPrice(displayPrice)}
              </span>
              {displayOrigPrice > displayPrice && (
                <span className="text-[10px] sm:text-xs text-muted-foreground/70 line-through shrink-0">
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
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0"
                >
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <button
                    onClick={handleAddToCart}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r ${accent.btn} text-white flex items-center justify-center hover:shadow-lg transition-all duration-200 active:scale-90 shrink-0`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Buy Now → express checkout (order summary + delivery details) with THIS
              product preselected. Never opens the product page or quick view. */}
          <button
            type="button"
            onClick={() => {
              const bn = buildBuyNowItem(product, selectedVariant, 1);
              setBuyNowItem(bn);
              navigate("/buy-now", { state: { item: bn } });
            }}
            className={`flex w-full mt-1 h-9 sm:h-10 items-center justify-center rounded-xl bg-gradient-to-r ${accent.btn} text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.97] transition-all`}
          >
            Buy Now
          </button>
        </div>
      </div>

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
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => {
                setShowAuthDialog(false);
                navigate(`/login?redirect=/products/${product._id}`);
              }}
            >
              Login
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                setShowAuthDialog(false);
                navigate(`/register?redirect=/products/${product._id}`);
              }}
            >
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProductCard;
