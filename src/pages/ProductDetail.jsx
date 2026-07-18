import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  Clock,
  Check,
  Heart,
  Zap,
  ZoomIn,
  Home,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StarRating from "@/components/atoms/StarRating";
import ReviewCard from "@/components/molecules/ReviewCard";
import ProductCard from "@/components/molecules/ProductCard";
import { useProduct } from "@/hooks/useProducts";
import { useReviews, useAddReview, useDeleteReview } from "@/hooks/useReviews";
import { useAddToCart, useClearCart } from "@/hooks/useCart";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";
import { productApi } from "@/api/product.api";
import { formatPrice } from "@/lib/utils";
import { isFashionCategory } from "@/lib/categories";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [addedBounce, setAddedBounce] = useState(false);

  const { data: product, isLoading } = useProduct(id);
  const { data: reviews } = useReviews(id);
  const addToCart = useAddToCart();
  const clearCart = useClearCart();
  const addReview = useAddReview(id);
  const deleteReview = useDeleteReview(id);

  const hasVariants = product?.variants?.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(null);
  useEffect(() => {
    if (hasVariants && !selectedVariant) setSelectedVariant(product.variants[0]);
  }, [product, hasVariants, selectedVariant]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayOrigPrice = selectedVariant?.originalPrice ?? product?.originalPrice;
  const discount =
    displayOrigPrice > displayPrice ? Math.round((1 - displayPrice / displayOrigPrice) * 100) : 0;

  const images =
    product?.images?.length > 0 ? product.images : ["https://placehold.co/600x600?text=No+Image"];
  const isFashion = isFashionCategory(product?.category?.name);

  const { data: relatedData } = useQuery({
    queryKey: ["related-products", product?.category?._id, id],
    queryFn: () =>
      productApi.getAll({ category: product.category._id, limit: 8 }).then((r) => r.data.data),
    enabled: !!product?.category?._id,
  });
  const relatedProducts = relatedData?.products?.filter((p) => p._id !== id)?.slice(0, 5) || [];

  const handleAddToCart = () => {
    if (!user) {
      setShowAuthDialog(true);
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
          setAddedBounce(true);
          setTimeout(() => setAddedBounce(false), 600);
          toast({
            title: `Added ${qty} × ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ""} to cart!`,
          });
        },
        onError: () => toast({ title: "Failed to add to cart", variant: "destructive" }),
      },
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (user.role !== "customer") {
      toast({ title: "Only customers can buy", variant: "destructive" });
      return;
    }
    clearCart.mutate(undefined, {
      onSuccess: () => {
        addToCart.mutate(
          { productId: id, quantity: qty, variant: selectedVariant?.name, price: displayPrice },
          {
            onSuccess: () => navigate("/checkout"),
            onError: () => toast({ title: "Failed to process buy now", variant: "destructive" }),
          },
        );
      },
      onError: () => {
        addToCart.mutate(
          { productId: id, quantity: qty, variant: selectedVariant?.name, price: displayPrice },
          {
            onSuccess: () => navigate("/checkout"),
            onError: () => toast({ title: "Failed to process buy now", variant: "destructive" }),
          },
        );
      },
    });
  };

  const handleReview = (e) => {
    e.preventDefault();
    addReview.mutate(
      { rating, comment },
      {
        onSuccess: () => {
          setComment("");
          toast({ title: "Review added!" });
        },
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Error", variant: "destructive" }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton className="h-[400px] md:h-[500px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product)
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-4">🍽️</p>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Product not found</h2>
        <p className="text-stone-500 mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-24 md:pb-12"
    >
      {/* ─── Breadcrumb ─── */}
      <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
        <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 flex-wrap">
          <li>
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:text-[#D2691E] transition-colors"
            >
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          </li>
          {product.category?.name && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
              <li>
                <Link
                  to={`/category/${product.category.name.toLowerCase()}`}
                  className="hover:text-[#D2691E] transition-colors"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <li className="font-semibold text-stone-800 truncate max-w-[160px] sm:max-w-xs">
            {product.name}
          </li>
        </ol>
      </nav>

      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* ─── Image Gallery ─── */}
        <div className="space-y-3">
          <div
            className={`relative overflow-hidden rounded-2xl bg-stone-100 border border-stone-200 ${isFashion ? "aspect-[3/4]" : "aspect-square"}`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                alt={product.name}
                onClick={() => setZoomOpen(true)}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover cursor-zoom-in"
              />
            </AnimatePresence>
            {/* Zoom hint */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md pointer-events-none">
              <ZoomIn className="h-4 w-4 text-stone-700" />
            </div>
            {discount > 0 && (
              <div className="absolute top-4 left-4">
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                  🔥 {discount}% OFF
                </div>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft className="h-4 w-4 text-stone-700" />
                </button>
                <button
                  onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight className="h-4 w-4 text-stone-700" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? "border-[#D2691E] ring-1 ring-[#D2691E]" : "border-stone-200 hover:border-stone-300"}`}
                >
                  {" "}
                  {}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Product Info ─── */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
                {product.category?.name || "Food"}
              </Badge>
              {product.isVeg !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.isVeg ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${product.isVeg ? "bg-green-600" : "bg-red-600"}`}
                  />
                  {product.isVeg ? "Veg" : "Non-Veg"}
                </span>
              )}
              {product.isNew && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-[10px]">
                  New
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white border-0 text-[10px]">
                  Best Seller
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(product.averageRating || 0)} />
                <span className="text-sm font-semibold text-stone-700 ml-1">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <span className="text-sm text-stone-400">({product.totalReviews || 0} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-bold text-[#D2691E]">
              {formatPrice(displayPrice)}
            </span>
            {displayOrigPrice > displayPrice && (
              <span className="text-lg text-stone-400 line-through">
                {formatPrice(displayOrigPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
                {discount}% off
              </span>
            )}
          </div>

          <p className="text-stone-600 leading-relaxed">{product.description}</p>

          {product.ingredients?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Ingredients
              </h4>
              <p className="text-sm text-stone-500">{product.ingredients.join(", ")}</p>
            </div>
          )}

          {product.allergens?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700">⚠ Allergen Info</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Contains: {product.allergens.join(", ")}
              </p>
            </div>
          )}

          {/* Variants */}
          {hasVariants && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Choose Size/Weight
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQty(1);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${selectedVariant?.name === v.name ? "border-[#D2691E] bg-[#FFF8F0] text-[#D2691E] shadow-sm" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                  >
                    <span>{v.name}</span>
                    {v.price !== product.price && (
                      <span className="block text-[10px] font-normal text-stone-400">
                        {formatPrice(v.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Add to Cart & Buy Now — in-flow, right below the product.
              Stacks full-width on phones; single row from sm up. */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center justify-center border border-stone-200 rounded-xl overflow-hidden shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-12 w-12 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-500"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 text-sm font-bold text-stone-800 min-w-[32px] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="h-12 w-12 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex-1 w-full">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={addToCart.isLoading}
                className="w-full bg-gradient-to-r from-[#D2691E] to-[#E8A04F] hover:from-[#A0522D] hover:to-[#D2691E] text-white border-0 shadow-lg shadow-[#D2691E]/20 text-sm font-bold py-6 rounded-xl active:scale-95 transition-transform"
              >
                <motion.div
                  animate={addedBounce ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-2"
                >
                  {addedBounce ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )}
                  {addedBounce ? "Added!" : `Add to Cart — ${formatPrice(displayPrice * qty)}`}
                </motion.div>
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                size="lg"
                onClick={handleBuyNow}
                disabled={addToCart.isLoading || clearCart.isLoading}
                className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white border-0 shadow-lg text-sm font-bold py-6 px-6 rounded-xl gap-2 active:scale-95 transition-transform"
              >
                <Zap className="h-5 w-5" />
                Buy Now
              </Button>
            </motion.div>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Truck, label: "Free delivery", sub: "Orders above ₹299" },
              { icon: Clock, label: "30-45 min", sub: "Estimated delivery" },
              { icon: Shield, label: "Quality", sub: "100% fresh guarantee" },
              { icon: Check, label: "In stock", sub: `${product.stock || 0} available` },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100"
              >
                <item.icon className="h-4 w-4 text-[#D2691E] shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-stone-700">{item.label}</p>
                  <p className="text-[10px] text-stone-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Related Products ─── */}
      {relatedProducts.length > 0 && (
        <motion.div variants={itemVariants} className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900">You May Also Like</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-stone-500 hover:text-[#D2691E] gap-1"
              asChild
            >
              <Link to={`/category/${product.category?.name?.toLowerCase()}`}>
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p._id} product={p} staggerIndex={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Reviews ─── */}
      <motion.div variants={itemVariants} className="mt-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">
          Customer Reviews ({reviews?.length || 0})
        </h2>
        {user?.role === "customer" && (
          <form
            onSubmit={handleReview}
            className="border border-stone-200 rounded-xl p-5 space-y-4 bg-white mb-6"
          >
            <h3 className="font-semibold text-stone-800">Write a Review</h3>
            <div>
              <StarRating rating={rating} interactive onChange={setRating} size={22} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D2691E] resize-none"
            />
            <Button
              type="submit"
              disabled={addReview.isLoading}
              className="bg-[#D2691E] hover:bg-[#A0522D] text-white border-0"
            >
              Submit Review
            </Button>
          </form>
        )}
        <div className="space-y-3">
          {reviews?.length > 0 ? (
            reviews.map((r) => (
              <ReviewCard key={r._id} review={r} onDelete={(id) => deleteReview.mutate(id)} />
            ))
          ) : (
            <p className="text-stone-400 text-sm py-8 text-center">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </motion.div>

      {/* ─── Sticky Mobile CTA ─── */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200 p-4 md:hidden shadow-2xl"
      >
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-2.5 hover:bg-stone-50"
            >
              <Minus className="h-4 w-4 text-stone-500" />
            </button>
            <span className="px-3 text-sm font-bold text-stone-800 min-w-[24px] text-center">
              {qty}
            </span>
            <button onClick={() => setQty(qty + 1)} className="p-2.5 hover:bg-stone-50">
              <Plus className="h-4 w-4 text-stone-500" />
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={addToCart.isLoading}
            className="flex-1 bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white border-0 shadow-lg py-6 rounded-xl text-sm font-bold min-h-[52px]"
          >
            <motion.div
              animate={addedBounce ? { scale: [1, 1.3, 1] } : {}}
              className="flex items-center gap-2 justify-center"
            >
              {addedBounce ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {addedBounce ? "Added!" : `Add to Cart — ${formatPrice(displayPrice * qty)}`}
            </motion.div>
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={addToCart.isLoading || clearCart.isLoading}
            className="bg-stone-900 hover:bg-stone-800 text-white border-0 shadow-lg py-6 px-4 rounded-xl text-sm font-bold min-h-[52px] gap-1.5"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </Button>
        </div>
      </motion.div>
      <div className="h-20 md:hidden" />

      {/* ─── Image Zoom Lightbox ─── */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-3xl p-4 sm:p-3 bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>Zoomed product image</DialogDescription>
          </DialogHeader>
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          {images.length > 1 && (
            <div className="flex justify-center gap-2 pt-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? "border-[#D2691E]" : "border-stone-200 hover:border-stone-300"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Auth Dialog ─── */}
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
              size="lg"
              className="w-full"
              onClick={() => {
                setShowAuthDialog(false);
                navigate(`/login?redirect=/products/${id}`);
              }}
            >
              Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAuthDialog(false);
                navigate(`/register?redirect=/products/${id}`);
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

export default ProductDetail;
