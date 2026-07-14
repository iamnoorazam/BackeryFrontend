import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CartItem from "@/components/molecules/CartItem";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { LogIn, UserPlus, ShoppingBag, MapPin, Truck, ShieldCheck, ArrowRight } from "lucide-react";

const Cart = () => {
  const { data: cart, isLoading } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-stone-400">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="py-6 sm:py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Your Cart</h1>
        <p className="text-stone-400 text-sm mb-6">Items you add will appear here</p>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Browse our products and add something delicious!"
          action={
            <Button variant="premium" size="lg" asChild>
              <Link to="/products">
                <ShoppingBag className="h-4 w-4" />
                Browse Menu
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
    } else {
      navigate("/checkout");
    }
  };

  const subtotal = cart.totalPrice || 0;
  const deliveryCharge = 49;
  const total = subtotal + deliveryCharge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-8"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">Your Cart</h1>
      <p className="text-stone-400 text-sm mb-5">{cart.items.length} item{cart.items.length > 1 ? "s" : ""} in your cart</p>

      {/* Delivery Info */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 text-orange-700">
          <MapPin className="h-4 w-4" /> 8.7 km from store
        </span>
        <span className="text-orange-300 hidden sm:inline">|</span>
        <span className="flex items-center gap-1.5 text-orange-700">
          <Truck className="h-4 w-4" /> 30-45 min delivery
        </span>
        <span className="text-orange-300 hidden sm:inline">|</span>
        <span className="flex items-center gap-1.5 text-orange-700">
          <ShieldCheck className="h-4 w-4" /> Fresh guaranteed
        </span>
      </div>

      {/* Cart Items */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-soft">
        {cart.items.map((item) => (
          <CartItem key={item._id || item.product?._id} item={item} />
        ))}
      </div>

      {/* Bill Summary */}
      <div className="mt-4 bg-white border border-stone-200/80 rounded-2xl p-4 shadow-soft space-y-3">
        <h3 className="font-bold text-stone-900 text-sm">Bill Summary</h3>
        <div className="flex justify-between text-sm text-stone-500">
          <span>Subtotal ({cart.items.length} items)</span>
          <span className="text-stone-900 font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-stone-500">
          <span>Delivery charge</span>
          <span className="text-stone-900 font-medium">{formatPrice(deliveryCharge)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span className="text-stone-900">Total</span>
          <span className="text-orange-600">{formatPrice(total)}</span>
        </div>
        <Button
          variant="premium"
          size="lg"
          className="w-full mt-2"
          onClick={handleCheckout}
        >
          Proceed to Checkout <ArrowRight className="h-4 w-4" />
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
            <div className="relative my-1">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-stone-400">or</span>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-stone-500" onClick={() => { setShowAuthDialog(false); navigate("/checkout"); }}>
              <ShoppingBag className="h-4 w-4 mr-2" /> Continue as Guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Cart;
