import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useAuth } from "@/store/authStore";
import CheckoutForm from "@/components/organisms/CheckoutForm";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const placeOrder = usePlaceOrder();

  useEffect(() => {
    if (!cartLoading && !isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [isLoggedIn, cartLoading, navigate, location.pathname]);

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-3xl mx-auto pb-8 sm:pb-12 px-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Checkout</h1>
      <p className="text-stone-500 mb-4 sm:mb-6 text-xs sm:text-sm">Complete your order details</p>

      <CheckoutForm
        cart={cart}
        user={user}
        isLoggedIn={isLoggedIn}
        placeOrder={placeOrder}
        onViewOrders={() => navigate("/orders")}
        onContinueShopping={() => navigate("/products")}
      />
    </div>
  );
};

export default Checkout;
