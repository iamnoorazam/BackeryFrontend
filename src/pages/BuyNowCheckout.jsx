import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag, ArrowRight, ArrowLeft, Minus, Plus, ShieldCheck, Tag, Search, Crosshair, Loader2, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { useDeliveryQuote } from "@/hooks/useDeliveryQuote";
import DeliveryQuote from "@/components/organisms/checkout/DeliveryQuote";
import { computeCheckout, isDeliverableKm, PLATFORM_FEE, TAX_RATE } from "@/lib/deliveryPricing";
import {
  getBuyNowItem, setBuyNowItem, getBuyNowShipping, setBuyNowShipping,
  getBuyNowQuote, setBuyNowQuote, computeBuyNowTotals,
} from "@/lib/buyNow";

const REQUIRED = ["fullName", "mobile", "email", "house", "street", "city", "state", "pincode"];
const emptyForm = {
  fullName: "", mobile: "", email: "", house: "", street: "",
  landmark: "", city: "", state: "", pincode: "",
};

const Field = ({ label, name, value, onChange, error, required, type = "text", placeholder, className }) => (
  <div className={className}>
    <label htmlFor={name} className="block text-xs font-semibold text-foreground mb-1.5">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      inputMode={type === "tel" ? "numeric" : undefined}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-11 px-3.5 rounded-xl border-2 bg-surface text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all ${
        error ? "border-danger focus:ring-2 focus:ring-danger/20" : "border-input focus:border-primary focus:ring-2 focus:ring-primary/15"
      }`}
    />
    {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
  </div>
);

const BuyNowCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  const [item, setItem] = useState(() => location.state?.item || getBuyNowItem());
  const [form, setForm] = useState(() => ({ ...emptyForm, ...getBuyNowShipping() }));
  const [errors, setErrors] = useState({});
  const rehydrated = useRef(false);

  const dq = useDeliveryQuote();

  useEffect(() => {
    if (item) setBuyNowItem(item);
  }, [item]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      fullName: f.fullName || user?.name || "",
      mobile: f.mobile || (user?.phone || "").replace(/\D/g, "").slice(-10),
      email: f.email || user?.email || "",
    }));
  }, [user]);

  useEffect(() => {
    setBuyNowShipping(form);
  }, [form]);

  // Rehydrate the distance quote after a refresh (coords ride along on the
  // persisted quote; setLocation re-fetches through the cache).
  useEffect(() => {
    if (rehydrated.current) return;
    rehydrated.current = true;
    const q = getBuyNowQuote();
    if (q?.customer?.lat != null) dq.setLocation(q.customer.lat, q.customer.lng);
  }, [dq]);

  useEffect(() => {
    if (dq.quote) setBuyNowQuote(dq.quote);
  }, [dq.quote]);

  const totals = useMemo(() => computeBuyNowTotals(item), [item]);
  const distanceKm = dq.quote?.distanceKm ?? null;
  const deliverable = dq.quote ? dq.quote.isDeliverable && isDeliverableKm(distanceKm) : true;
  const checkout = useMemo(
    () => computeCheckout({ productTotal: totals.payable, deliveryCharge: dq.quote?.deliveryCharge ?? null, distanceKm }),
    [totals.payable, dq.quote, distanceKm],
  );
  const hasQuote = !!dq.quote;
  const grandTotal = hasQuote ? checkout.grandTotal : totals.payable + PLATFORM_FEE + Math.round(totals.payable * TAX_RATE);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => (er[name] ? { ...er, [name]: undefined } : er));
  }, []);

  const onPlaceSelected = useCallback((p) => {
    setForm((f) => ({
      ...f,
      street: p.street || p.line1 || f.street,
      city: p.city || f.city,
      state: p.state || f.state,
      pincode: p.pincode || f.pincode,
    }));
  }, []);

  const checkManualAddress = () => {
    const composed = [form.house, form.street, form.city, form.state, form.pincode].filter(Boolean).join(", ");
    if (composed) dq.geocodeManual(composed);
  };

  const setQty = (delta) =>
    setItem((it) => (it ? { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) } : it));

  const validate = () => {
    const e = {};
    REQUIRED.forEach((k) => {
      if (!String(form[k] || "").trim()) e[k] = "Required";
    });
    if (form.mobile && !/^\d{10}$/.test(form.mobile.trim())) e.mobile = "Enter a valid 10-digit mobile number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = (ev) => {
    ev.preventDefault();
    if (!validate()) {
      const firstBad = REQUIRED.find((k) => !String(form[k] || "").trim());
      document.querySelector(`[name="${firstBad}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (dq.quote && !deliverable) return;
    setBuyNowShipping(form);
    setBuyNowQuote(dq.quote);
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent("/buy-now/payment")}`);
      return;
    }
    navigate("/buy-now/payment");
  };

  if (!item) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">Nothing to check out</h1>
        <p className="text-sm text-muted-foreground mb-6">Pick a product and hit “Buy Now”.</p>
        <Button variant="premium" size="lg" asChild>
          <Link to="/products"><ShoppingBag className="h-4 w-4" /> Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const customerAddress = [form.house, form.street, form.city, form.state, form.pincode].filter(Boolean).join(", ");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto pb-10">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review your order and enter delivery details</p>
      </div>

      <form onSubmit={handleContinue} className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        {/* ── Left: address search + delivery details + live distance ── */}
        <div className="space-y-4 order-2 lg:order-1">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-soft">
            <h2 className="font-bold text-foreground text-sm sm:text-base mb-4">Delivery details</h2>

            {/* Address search (Google Places) + GPS */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Search your address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
                  <input
                    ref={(el) => dq.initAutocomplete(el, onPlaceSelected)}
                    type="text"
                    placeholder={dq.mapsReady ? "Start typing your address…" : "Type address, then tap Check"}
                    className="w-full h-11 pl-9 pr-3 rounded-xl border-2 border-input bg-surface text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <Button type="button" variant="outline" size="lg" onClick={() => dq.locateByGPS()} disabled={dq.locating} className="shrink-0 gap-1.5">
                  {dq.locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                  <span className="hidden sm:inline">GPS</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="Full Name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} required placeholder="John Doe" />
              <Field label="Mobile Number" name="mobile" type="tel" value={form.mobile} onChange={onChange} error={errors.mobile} required placeholder="9876543210" />
              <Field className="sm:col-span-2" label="Email Address" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} required placeholder="john@example.com" />
              <Field label="House / Flat No." name="house" value={form.house} onChange={onChange} error={errors.house} required placeholder="A-101" />
              <Field label="Street / Area" name="street" value={form.street} onChange={onChange} error={errors.street} required placeholder="MG Road" />
              <Field className="sm:col-span-2" label="Landmark (optional)" name="landmark" value={form.landmark} onChange={onChange} placeholder="Near City Mall" />
              <Field label="City" name="city" value={form.city} onChange={onChange} error={errors.city} required placeholder="Mumbai" />
              <Field label="State" name="state" value={form.state} onChange={onChange} error={errors.state} required placeholder="Maharashtra" />
              <Field label="Pincode" name="pincode" type="tel" value={form.pincode} onChange={onChange} error={errors.pincode} required placeholder="400001" />
            </div>

            <button type="button" onClick={checkManualAddress} className="mt-3 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> Check delivery distance for this address
            </button>
          </div>

          {/* Live delivery distance panel */}
          <DeliveryQuote
            mapsReady={dq.mapsReady}
            store={dq.store}
            coords={dq.coords}
            quote={dq.quote}
            loading={dq.loading}
            error={dq.error}
            customerAddress={customerAddress}
            deliverable={deliverable}
          />

          <div className="hidden lg:flex items-center gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/products")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Shopping
            </Button>
            <Button type="submit" variant="premium" size="lg" disabled={hasQuote && !deliverable} className="flex-1 gap-2">
              Continue to Payment <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Right: Order summary ── */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-20 space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            <div className="px-4 sm:px-5 py-3 border-b border-border">
              <h2 className="font-bold text-foreground text-sm sm:text-base">Order Summary</h2>
            </div>

            <div className="p-4 sm:p-5 flex gap-3.5">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                <img src={item.image || "https://placehold.co/80x80"} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{item.name}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {item.size && <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Size: {item.size}</span>}
                  {item.color && <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Color: {item.color}</span>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Qty</span>
                  <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
                    <button type="button" onClick={() => setQty(-1)} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-bold text-foreground">{totals.qty}</span>
                    <button type="button" onClick={() => setQty(1)} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="px-4 sm:px-5 pb-4 space-y-2 text-sm border-t border-border pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Product Total ({totals.qty} item{totals.qty > 1 ? "s" : ""})</span>
                <span className="text-foreground">{formatPrice(totals.listTotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span className="inline-flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Discount</span>
                  <span>−{formatPrice(totals.discount)}</span>
                </div>
              )}
              <motion.div key={`del-${dq.quote?.deliveryCharge ?? "na"}`} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="flex justify-between text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery Charge {distanceKm != null && <span className="text-[11px]">({distanceKm} km)</span>}</span>
                <span>
                  {dq.loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin inline" />
                  ) : hasQuote ? (
                    checkout.deliveryCharge === 0 ? <span className="text-success font-semibold">FREE</span> : formatPrice(checkout.deliveryCharge)
                  ) : (
                    <span className="text-muted-foreground/70">Add address</span>
                  )}
                </span>
              </motion.div>
              {PLATFORM_FEE > 0 && (
                <div className="flex justify-between text-muted-foreground"><span>Platform Fee</span><span className="text-foreground">{formatPrice(PLATFORM_FEE)}</span></div>
              )}
              {TAX_RATE > 0 && (
                <div className="flex justify-between text-muted-foreground"><span>Taxes (GST)</span><span className="text-foreground">{formatPrice(Math.round(totals.payable * TAX_RATE))}</span></div>
              )}
              <motion.div key={`total-${grandTotal}`} initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span className="text-foreground">Grand Total</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </motion.div>
              {totals.discount > 0 && <p className="text-[11px] text-success font-medium pt-1">You save {formatPrice(totals.discount)} on this order 🎉</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
            <ShieldCheck className="h-4 w-4 text-success shrink-0" /> Safe & secure checkout. Your details are protected.
          </div>
        </div>

        {/* Mobile action bar */}
        <div className="order-3 lg:hidden sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-t border-border safe-area-bottom">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/products")} className="shrink-0 gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button type="submit" variant="premium" size="lg" disabled={hasQuote && !deliverable} className="flex-1 gap-2">
              Continue — {formatPrice(grandTotal)}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default BuyNowCheckout;
