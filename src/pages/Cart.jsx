import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CartItem from "@/components/molecules/CartItem";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useCart, useValidateCart, useRemoveFromCart } from "@/hooks/useCart";
import { useApplyCoupon, useAppliedCoupon } from "@/hooks/useCoupon";
import { getAppliedCode, setAppliedCode, clearAppliedCode } from "@/lib/appliedCoupon";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";
import {
  LogIn, UserPlus, ShoppingBag, ArrowRight, Store, Clock, AlertTriangle, Info, PackageX, Tag, X, Check,
} from "lucide-react";

const StoreHeader = ({ vendor }) => {
  if (!vendor) {
    return (
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/50">
        <ShoppingBag className="h-4 w-4 text-muted-foreground/70" />
        <span className="font-bold text-foreground text-sm">Your items</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/50">
      <Link to={`/store/${vendor.slug}`} className="flex items-center gap-3 min-w-0 group">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-card border border-border shrink-0">
          {vendor.logo ? (
            <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary"><Store className="h-4 w-4" /></div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">{vendor.name}</p>
          {vendor.avgDeliveryTime && (
            <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {vendor.avgDeliveryTime}
            </p>
          )}
        </div>
      </Link>
      <span
        className={`ml-auto shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
          vendor.isOpen ? "bg-success-subtle text-success" : "bg-muted text-muted-foreground"
        }`}
      >
        {vendor.isOpen ? "Open" : "Closed"}
      </span>
    </div>
  );
};

const IssueBanner = ({ issues, onRemove }) => (
  <div className="rounded-2xl border border-warning/30 bg-warning-subtle p-4 space-y-2">
    <div className="flex items-center gap-2 text-warning font-bold text-sm">
      <AlertTriangle className="h-4 w-4" /> Please review your cart
    </div>
    <ul className="space-y-1.5">
      {issues.map((issue, i) => (
        <li key={i} className="flex items-center justify-between gap-2 text-xs text-warning">
          <span>
            {issue.type === "price_changed"
              ? `${issue.name}: price updated ${formatPrice(issue.oldPrice)} → ${formatPrice(issue.newPrice)}`
              : issue.message}
          </span>
          {issue.productId && issue.type !== "price_changed" && (
            <button
              onClick={() => onRemove(issue.productId)}
              className="shrink-0 inline-flex items-center gap-1 font-semibold text-danger hover:opacity-80"
            >
              <PackageX className="h-3 w-3" /> Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const Cart = () => {
  const { data: cart, isLoading } = useCart();
  const { data: validation } = useValidateCart();
  const { user, isLoggedIn } = useAuth();
  const removeItem = useRemoveFromCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const canUseCoupon = isLoggedIn && user?.role === "customer";
  const [couponCode, setCouponCode] = useState(getAppliedCode());
  const [codeInput, setCodeInput] = useState("");
  const applyCoupon = useApplyCoupon();
  // Re-preview the applied code whenever cart contents change.
  const cartSig = useMemo(
    () => (cart?.items || []).map((i) => `${i.product?._id}:${i.quantity}:${i.price}`).join("|"),
    [cart],
  );
  const couponPreview = useAppliedCoupon(canUseCoupon ? couponCode : null, cartSig);

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    applyCoupon.mutate(code, {
      onSuccess: (data) => {
        setCouponCode(data.code);
        setAppliedCode(data.code);
        setCodeInput("");
        toast({ title: `Coupon ${data.code} applied — you saved ${formatPrice(data.discount)}` });
      },
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Invalid coupon", variant: "destructive" }),
    });
  };

  const handleRemoveCoupon = () => {
    setCouponCode(null);
    clearAppliedCode();
  };

  // Normalize to groups: backend supplies `groups` for logged-in carts;
  // guest carts fall back to a single unnamed group.
  const groups = useMemo(() => {
    if (cart?.groups?.length) return cart.groups;
    if (cart?.items?.length) {
      return [{
        vendor: null,
        items: cart.items,
        subtotal: cart.totalPrice || 0,
        itemCount: cart.items.length,
        packagingCharge: 0,
        minOrderValue: 0,
        meetsMinOrder: true,
        amountToMinOrder: 0,
      }];
    }
    return [];
  }, [cart]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground/70">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="py-6 sm:py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Your Cart</h1>
        <p className="text-muted-foreground/70 text-sm mb-6">Items you add will appear here</p>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Browse stores and add something delicious!"
          action={
            <Button variant="premium" size="lg" asChild>
              <Link to="/stores"><ShoppingBag className="h-4 w-4" /> Explore Stores</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isLoggedIn) setShowAuthDialog(true);
    else navigate("/checkout");
  };

  const subtotal = cart.totalPrice || 0;
  const packagingTotal = cart.packagingTotal ?? groups.reduce((n, g) => n + (g.packagingCharge || 0), 0);
  const couponActive = canUseCoupon && couponCode && couponPreview.data && !couponPreview.isError;
  const discount = couponActive ? (couponPreview.data.discount || 0) : 0;
  const total = subtotal + packagingTotal - discount;
  const itemCount = cart.itemCount ?? cart.items.length;
  const multiStore = groups.length > 1;
  const anyBelowMin = groups.some((g) => !g.meetsMinOrder && g.minOrderValue > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Your Cart</h1>
      <p className="text-muted-foreground/70 text-sm mb-5">
        {itemCount} item{itemCount > 1 ? "s" : ""}{multiStore ? ` from ${groups.length} stores` : ""}
      </p>

      {/* Validation issues */}
      {validation && !validation.valid && (
        <div className="mb-4">
          <IssueBanner issues={validation.issues} onRemove={(id) => removeItem.mutate(id)} />
        </div>
      )}

      {/* Multi-store note */}
      {multiStore && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          Your items are from different stores and will arrive as {groups.length} separate deliveries.
        </div>
      )}

      {/* Per-store groups */}
      <div className="space-y-4">
        {groups.map((group, gi) => (
          <div key={group.vendor?._id || `group-${gi}`} className="bg-card border border-border/70 rounded-2xl shadow-soft overflow-hidden">
            <StoreHeader vendor={group.vendor} />

            {!group.meetsMinOrder && group.minOrderValue > 0 && (
              <div className="px-4 py-2 bg-warning-subtle text-[11px] text-warning font-medium">
                Add {formatPrice(group.amountToMinOrder)} more to meet this store&apos;s minimum order of {formatPrice(group.minOrderValue)}.
              </div>
            )}

            <div className="p-4 pt-2">
              {group.items.map((item) => (
                <CartItem key={item._id || item.product?._id} item={item} />
              ))}
            </div>

            <div className="px-4 pb-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Item total</span>
                <span className="text-foreground font-semibold">{formatPrice(group.subtotal)}</span>
              </div>
              {group.packagingCharge > 0 && (
                <div className="flex justify-between text-muted-foreground/70 text-xs">
                  <span>Packaging</span>
                  <span>{formatPrice(group.packagingCharge)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      {canUseCoupon && (
        <div className="mt-4 bg-card border border-border/70 rounded-2xl p-4 shadow-soft">
          {couponActive ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success-subtle border border-success/30 text-success text-xs font-bold">
                  <Check className="h-3.5 w-3.5" /> {couponCode}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {couponPreview.data?.description || `You saved ${formatPrice(discount)}`}
                </span>
              </div>
              <button onClick={handleRemoveCoupon} className="shrink-0 p-1.5 rounded-lg text-muted-foreground/70 hover:text-danger hover:bg-danger-subtle transition-colors" aria-label="Remove coupon">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <Input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="pl-9 uppercase"
                  />
                </div>
                <Button type="submit" variant="outline" disabled={!codeInput.trim() || applyCoupon.isPending}>
                  {applyCoupon.isPending ? "Applying..." : "Apply"}
                </Button>
              </div>
              {couponCode && couponPreview.isError && (
                <p className="text-xs text-danger">
                  {couponPreview.error?.response?.data?.message || "This coupon no longer applies to your cart."}{" "}
                  <button type="button" onClick={handleRemoveCoupon} className="underline font-medium">Remove</button>
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Bill Summary */}
      <div className="mt-4 bg-card border border-border/70 rounded-2xl p-4 shadow-soft space-y-3">
        <h3 className="font-bold text-foreground text-sm">Bill Summary</h3>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal ({itemCount} items)</span>
          <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
        </div>
        {packagingTotal > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Packaging charges</span>
            <span className="text-foreground font-medium">{formatPrice(packagingTotal)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-success font-medium">
            <span>Coupon discount ({couponCode})</span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-muted-foreground/70">
          <span>Delivery &amp; taxes</span>
          <span className="italic">Calculated at checkout</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span className="text-foreground">Subtotal</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
        <Button
          variant="premium"
          size="lg"
          className="w-full mt-2"
          onClick={handleCheckout}
          disabled={anyBelowMin}
        >
          {anyBelowMin ? "Minimum order not met" : "Proceed to Checkout"}
          {!anyBelowMin && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Login to Place Order</DialogTitle>
            <DialogDescription className="text-center">
              You need an account to place an order. Your cart items will be saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate(`/login?redirect=${encodeURIComponent("/checkout")}`)}>
              <LogIn className="h-4 w-4 mr-2" /> Login
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate(`/register?redirect=${encodeURIComponent("/checkout")}`)}>
              <UserPlus className="h-4 w-4 mr-2" /> Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Cart;
