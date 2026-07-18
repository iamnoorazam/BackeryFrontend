import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Check, Minus, Plus, Star, ChevronLeft, ChevronRight,
  ArrowUpRight, Truck, Clock,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";
import { isFashionCategory } from "@/lib/categories";
import { buildBuyNowItem, setBuyNowItem } from "@/lib/buyNow";

/**
 * Product Quick View — opens as a bottom-sheet (mobile) / centered modal (desktop)
 * over whatever page the shopper was on, via the App's background-location route.
 * Seeds instantly from the product object carried in `location.state` (the same
 * object the grid already rendered), then background-refreshes full detail through
 * the shared ["product", id] React Query cache — so there's no loading flash for
 * anything already in cache.
 */
const ProductQuickView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const seed = location.state?.product;
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading } = useProduct(id, {
    initialData: seed && seed._id === id ? seed : undefined,
  });

  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const hasVariants = product?.variants?.length > 0;
  useEffect(() => {
    if (hasVariants && !selectedVariant) setSelectedVariant(product.variants[0]);
  }, [product, hasVariants, selectedVariant]);

  const isFashion = isFashionCategory(product?.category?.name);
  const images = useMemo(
    () => (product?.images?.length ? product.images : ["https://placehold.co/600x600?text=No+Image"]),
    [product],
  );

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayOrigPrice = selectedVariant?.originalPrice ?? product?.originalPrice;
  const discount =
    displayOrigPrice > displayPrice ? Math.round((1 - displayPrice / displayOrigPrice) * 100) : 0;

  const close = () => navigate(-1);
  const viewFullDetails = () => navigate(`/products/${id}`, { replace: true });

  const handleBuyNow = () => {
    if (user && user.role !== "customer") {
      toast({ title: "Only customers can buy", variant: "destructive" });
      return;
    }
    const bn = buildBuyNowItem(product, selectedVariant, qty);
    setBuyNowItem(bn);
    navigate("/buy-now", { state: { item: bn } });
  };

  const handleAddToCart = () => {
    if (!user) {
      close();
      navigate(`/login?redirect=/products/${id}`);
      return;
    }
    if (user.role !== "customer") {
      toast({ title: "Only customers can add to cart", variant: "destructive" });
      return;
    }
    addToCart.mutate(
      { productId: id, quantity: qty, variant: selectedVariant?.name, price: displayPrice },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
          toast({ title: `Added ${qty} × ${product.name} to cart!` });
        },
        onError: () => toast({ title: "Failed to add to cart", variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent fullScreen className="flex flex-col lg:flex-row">
        <DialogHeader className="sr-only">
          <DialogTitle>{product?.name || "Product"}</DialogTitle>
          <DialogDescription>Quick view</DialogDescription>
        </DialogHeader>

        {!product && isLoading ? (
          <div className="flex flex-col lg:flex-row w-full h-full">
            <Skeleton className="h-64 sm:h-80 lg:h-full lg:w-1/2 w-full rounded-none shrink-0" />
            <div className="p-6 space-y-3 flex-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ) : product ? (
          <>
            {/* ─── Gallery ─── */}
            <div className={`relative bg-muted overflow-hidden shrink-0 h-64 sm:h-80 lg:h-full lg:w-1/2 ${isFashion ? "sm:h-96" : ""}`}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              {discount > 0 && (
                <Badge variant="premium" className="absolute top-3 left-3 shadow-lg">{discount}% OFF</Badge>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/85 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/85 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        aria-label={`Image ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === selectedImage ? "w-5 bg-primary" : "w-1.5 bg-card/70"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ─── Details ─── */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-4 max-w-2xl w-full mx-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="uppercase tracking-wider">
                    {product.category?.name || "Item"}
                  </Badge>
                  {product.isBestSeller && <Badge variant="premium">Best Seller</Badge>}
                  {product.isNew && <Badge variant="success">New</Badge>}
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{product.name}</h2>
                  <div className="mt-1.5 flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-foreground">{product.averageRating?.toFixed(1) || "0.0"}</span>
                    </span>
                    <span className="text-muted-foreground/70">({product.totalReviews || 0} reviews)</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</span>
                  {displayOrigPrice > displayPrice && (
                    <span className="text-base text-muted-foreground/70 line-through">{formatPrice(displayOrigPrice)}</span>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{product.description}</p>
                )}

                {hasVariants && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {isFashion ? "Select size" : "Select size / weight"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.name}
                          onClick={() => { setSelectedVariant(v); setQty(1); }}
                          className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                            selectedVariant?.name === v.name
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-foreground/25"
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Free over ₹299</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> 30–45 min</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="lg" onClick={viewFullDetails} className="shrink-0 gap-1.5">
                    Details <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button variant="premium" size="lg" onClick={handleBuyNow} className="flex-1">
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Sticky action bar */}
              <div className="border-t border-border p-4 flex items-center gap-3 bg-card safe-area-bottom max-w-2xl w-full mx-auto">
                <div className="flex items-center border-2 border-border rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-bold text-foreground">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  variant={added ? "secondary" : "premium"}
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending}
                  className="flex-1 min-h-[44px]"
                >
                  <motion.span
                    key={added ? "added" : "add"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    {added ? "Added!" : `Add — ${formatPrice(displayPrice * qty)}`}
                  </motion.span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-10 text-center w-full self-center">
            <p className="text-muted-foreground mb-4">Product not found.</p>
            <Button asChild><Link to="/products">Browse products</Link></Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
