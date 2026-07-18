import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Banknote, CreditCard, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/authStore";
import { useAddToCart, useClearCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";
import OrderConfirmation from "@/components/organisms/checkout/OrderConfirmation";
import { computeCheckout, PLATFORM_FEE, TAX_RATE } from "@/lib/deliveryPricing";
import {
  getBuyNowItem, getBuyNowShipping, getBuyNowQuote, computeBuyNowTotals, buildOrderPayload, clearBuyNow,
} from "@/lib/buyNow";

const PAYMENTS = [
  { value: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when your order arrives" },
  { value: "online", label: "Online Payment", icon: CreditCard, desc: "UPI / Card / Netbanking" },
];

const BuyNowPayment = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const [item] = useState(getBuyNowItem);
  const [shipping] = useState(getBuyNowShipping);
  const [quote] = useState(getBuyNowQuote);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderResult, setOrderResult] = useState(null);

  const clearCart = useClearCart();
  const addToCart = useAddToCart();
  const placeOrder = usePlaceOrder();
  const placing = clearCart.isPending || addToCart.isPending || placeOrder.isPending;

  const totals = useMemo(() => computeBuyNowTotals(item), [item]);
  const checkout = useMemo(
    () => computeCheckout({ productTotal: totals.payable, deliveryCharge: quote?.deliveryCharge ?? null, distanceKm: quote?.distanceKm }),
    [totals.payable, quote],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent("/buy-now/payment")}`, { replace: true });
    } else if (!item || !shipping?.fullName) {
      navigate("/buy-now", { replace: true });
    }
  }, [isLoggedIn, item, shipping, navigate]);

  const handlePlaceOrder = async () => {
    if (user?.role !== "customer") {
      toast({ title: "Only customers can place orders", variant: "destructive" });
      return;
    }
    try {
      await clearCart.mutateAsync();
      await addToCart.mutateAsync({
        productId: item.productId,
        quantity: item.quantity,
        variant: item.size || undefined,
        price: item.price,
      });
      const res = await placeOrder.mutateAsync(buildOrderPayload(shipping, paymentMethod, quote?.customer));

      const data = res?.data?.data || res?.data || {};
      const orders = Array.isArray(data.orders) ? data.orders : data._id ? [data] : [];
      const first = orders[0] || {};
      const groupTotal = data.totalPrice != null ? data.totalPrice : first.totalPrice || checkout.grandTotal;
      setOrderResult({
        id: data.orderGroup || first._id || "N/A",
        firstOrderId: first._id,
        name: shipping.fullName,
        address: first.deliveryAddress?.fullAddress || `${shipping.house}, ${shipping.city}`,
        time: first.estimatedDeliveryTime || quote?.estimatedTime || "Calculating...",
        stores: orders.map((o) => ({
          id: o._id, name: o.vendor?.name || "Store", delivery: o.deliveryCharge || 0,
          distance: o.deliveryDistance || quote?.distanceKm || 0, time: o.estimatedDeliveryTime || "", total: o.totalPrice || 0,
        })),
        total: groupTotal,
        walletUsed: data.walletUsed || 0,
        amountPayable: data.amountPayable != null ? data.amountPayable : groupTotal,
      });
      clearBuyNow();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast({
        title: err.response?.data?.message || err.userMessage || "Failed to place order",
        variant: "destructive",
      });
    }
  };

  if (orderResult) {
    return (
      <div className="py-4">
        <OrderConfirmation
          orderResult={orderResult}
          onViewOrders={() => navigate("/orders")}
          onContinueShopping={() => navigate("/products")}
          customerPhone={shipping.mobile}
          customerEmail={shipping.email}
        />
      </div>
    );
  }

  if (!item) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto pb-10">
      <div className="mb-5">
        <button onClick={() => navigate("/buy-now")} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to details
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Payment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Choose how you&apos;d like to pay</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-soft">
            <h2 className="font-bold text-foreground text-sm sm:text-base mb-4">Payment method</h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {PAYMENTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPaymentMethod(p.value)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === p.value ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-surface hover:border-input"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <p.icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{p.label}</p>
                      <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {paymentMethod === "online" && (
              <p className="mt-3 text-[11px] text-muted-foreground bg-muted rounded-lg p-2.5">
                You&apos;ll be able to complete the online payment right after placing the order.
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-foreground text-sm sm:text-base">Deliver to</h2>
              <button onClick={() => navigate("/buy-now")} className="text-xs font-semibold text-primary hover:underline">Change</button>
            </div>
            <p className="text-sm font-semibold text-foreground">{shipping.fullName} · {shipping.mobile}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {[shipping.house, shipping.street, shipping.landmark, `${shipping.city}, ${shipping.state} - ${shipping.pincode}`].filter(Boolean).join(", ")}
            </p>
            {quote?.distanceKm != null && (
              <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" /> {quote.distanceKm} km away · ETA {quote.durationText || `${quote.durationMinutes} min`}
              </p>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-20 space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            <div className="px-4 sm:px-5 py-3 border-b border-border">
              <h2 className="font-bold text-foreground text-sm sm:text-base">Order Summary</h2>
            </div>
            <div className="p-4 sm:p-5 flex gap-3.5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                <img src={item.image || "https://placehold.co/64x64"} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`, `Qty: ${totals.qty}`].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="px-4 sm:px-5 pb-4 space-y-2 text-sm border-t border-border pt-3">
              <div className="flex justify-between text-muted-foreground"><span>Product Total</span><span className="text-foreground">{formatPrice(totals.listTotal)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-success font-medium"><span>Discount</span><span>−{formatPrice(totals.discount)}</span></div>}
              <div className="flex justify-between text-muted-foreground"><span>Delivery {quote?.distanceKm != null && <span className="text-[11px]">({quote.distanceKm} km)</span>}</span><span className={checkout.deliveryCharge === 0 ? "text-success font-semibold" : "text-foreground"}>{checkout.deliveryCharge === 0 ? "FREE" : formatPrice(checkout.deliveryCharge)}</span></div>
              {PLATFORM_FEE > 0 && <div className="flex justify-between text-muted-foreground"><span>Platform Fee</span><span className="text-foreground">{formatPrice(PLATFORM_FEE)}</span></div>}
              {TAX_RATE > 0 && <div className="flex justify-between text-muted-foreground"><span>Taxes (GST)</span><span className="text-foreground">{formatPrice(checkout.taxes)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span className="text-foreground">Grand Total</span><span className="text-primary">{formatPrice(checkout.grandTotal)}</span></div>
            </div>
          </div>

          <Button onClick={handlePlaceOrder} disabled={placing} variant="premium" size="lg" className="w-full gap-2">
            {placing ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</> : `Place Order — ${formatPrice(checkout.grandTotal)}`}
          </Button>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
            <ShieldCheck className="h-4 w-4 text-success shrink-0" /> 100% Purchase Protection.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BuyNowPayment;
