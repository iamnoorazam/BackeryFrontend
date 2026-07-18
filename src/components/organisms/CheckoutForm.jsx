import { useState, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/store/Toast";
import { useWallet } from "@/hooks/useWallet";
import { useCheckoutDelivery } from "@/hooks/useCheckoutDelivery";
import { getAppliedCode, clearAppliedCode } from "@/lib/appliedCoupon";
import { formatPrice } from "@/lib/utils";
import {
  MapPin, Loader2, AlertTriangle, CreditCard, Banknote,
  ChevronDown, ChevronUp, User, FileText, Crosshair, Truck, Clock, Wallet
} from "lucide-react";
import RHFField from "./checkout/RHFField";
import CheckoutIssueButton from "./checkout/CheckoutIssueButton";
import OrderConfirmation from "./checkout/OrderConfirmation";
import { COUNTRY_CODES, COUNTRIES, checkoutSchema } from "./checkout/checkout.constants";

const CheckoutForm = ({ cart, user, isLoggedIn, placeOrder, onOrderSuccess, onOrderError, onViewOrders, onContinueShopping, className }) => {
  const { toast } = useToast();
  const [showBilling, setShowBilling] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const defaultValues = useMemo(() => ({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    countryCode: "+91",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    billingLine1: "",
    billingLine2: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "IN",
    sameAsShipping: true,
    orderNotes: "",
    paymentMethod: "cod",
  }), [user]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues,
  });

  const sameAsShipping = watch("sameAsShipping");
  const paymentMethod = watch("paymentMethod");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const phone = watch("phone");
  const line1 = watch("line1");
  const city = watch("city");
  const state = watch("state");
  const postalCode = watch("postalCode");

  const formRef = useRef(null);

  const syncAutofill = useCallback(() => {
    if (!formRef.current) return;
    const inputs = formRef.current.querySelectorAll("input, select, textarea");
    inputs.forEach((el) => {
      if (!el.name) return;
      if (el.type === "checkbox") {
        setValue(el.name, el.checked, { shouldValidate: false, shouldDirty: false });
      } else if (el.value !== undefined) {
        setValue(el.name, el.value, { shouldValidate: false, shouldDirty: false });
      }
    });
  }, [setValue]);

  const {
    mapsReady, mapsAvailable,
    locating, distanceLoading, distanceError, delivery, coordinates,
    initAutocomplete, getLocationByGPS, clearLocation,
  } = useCheckoutDelivery({ setValue });

  const { data: wallet } = useWallet();
  const walletBalance = wallet?.balance || 0;
  const [useWalletCredit, setUseWalletCredit] = useState(false);

  const subtotal = cart?.totalPrice || 0;
  const total = subtotal + (delivery?.deliveryCharge || 0);
  // Best-effort preview of the store credit applied (coupon is re-derived
  // server-side, so this ignores it; the confirmation shows the exact amount).
  const walletApplied = useWalletCredit ? Math.min(walletBalance, total) : 0;
  const payableAfterWallet = Math.max(0, total - walletApplied);

  const onSubmit = async (formData) => {
    if (!isLoggedIn || user?.role !== "customer") {
      toast({ title: "Please login to place order", variant: "destructive" });
      return;
    }
    if (!coordinates && mapsAvailable) {
      toast({ title: "Please select a valid address from suggestions", variant: "destructive" });
      return;
    }
    if (delivery && !delivery.isDeliverable) {
      toast({ title: "We cannot deliver to this address", variant: "destructive" });
      return;
    }

    const name = `${formData.firstName} ${formData.lastName}`.trim();

    const deliveryAddress = {
      line1: formData.line1,
      line2: formData.line2 || "",
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      fullAddress: `${formData.line1}${formData.line2 ? ", " + formData.line2 : ""}, ${formData.city}, ${formData.state} ${formData.postalCode}, ${formData.country}`,
      coordinates,
    };

    const payload = {
      customerName: name,
      customerEmail: formData.email,
      customerPhone: `${formData.countryCode} ${formData.phone}`,
      deliveryAddress,
      billingAddress: formData.sameAsShipping ? null : {
        line1: formData.billingLine1,
        line2: formData.billingLine2 || "",
        city: formData.billingCity,
        state: formData.billingState,
        postalCode: formData.billingPostalCode,
        country: formData.billingCountry || "IN",
        fullAddress: `${formData.billingLine1}${formData.billingLine2 ? ", " + formData.billingLine2 : ""}, ${formData.billingCity}, ${formData.billingState} ${formData.billingPostalCode}, ${formData.billingCountry}`,
      },
      sameAsShipping: formData.sameAsShipping,
      orderNotes: formData.orderNotes,
      paymentMethod: formData.paymentMethod,
      couponCode: getAppliedCode() || undefined,
      useWallet: useWalletCredit,
    };

    try {
      const res = await placeOrder.mutateAsync(payload);
      const data = res?.data?.data || res?.data || {};
      // Grouped shape from split checkout: { orderGroup, orders: [...], totalPrice }.
      // Fall back to a single-order shape for safety.
      const orders = Array.isArray(data.orders) ? data.orders : data._id ? [data] : [];
      const first = orders[0] || {};
      const groupTotal =
        data.totalPrice != null
          ? data.totalPrice
          : orders.reduce((s, o) => s + (o.totalPrice || 0), 0) || total;
      const result = {
        id: data.orderGroup || first._id || "N/A",
        firstOrderId: first._id || undefined,
        name: first.customerName || name,
        address: first.deliveryAddress?.fullAddress || `${formData.line1}, ${formData.city}`,
        time: first.estimatedDeliveryTime || "Calculating...",
        stores: orders.map((o) => ({
          id: o._id,
          name: o.vendor?.name || "Store",
          delivery: o.deliveryCharge || 0,
          distance: o.deliveryDistance || 0,
          time: o.estimatedDeliveryTime || "",
          total: o.totalPrice || 0,
        })),
        total: groupTotal,
        walletUsed: data.walletUsed || 0,
        amountPayable: data.amountPayable != null ? data.amountPayable : groupTotal,
      };
      clearAppliedCode();
      setOrderResult(result);
      onOrderSuccess?.(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err.response?.data?.message || err.userMessage || "Failed to place order";
      toast({ title: msg, variant: "destructive" });
      onOrderError?.(err);
    }
  };

  // ──── CONFIRMATION VIEW ────
  if (orderResult) {
    return (
      <OrderConfirmation
        orderResult={orderResult}
        onViewOrders={onViewOrders}
        onContinueShopping={onContinueShopping}
        customerPhone={watch("phone")}
        customerEmail={watch("email")}
        className={className}
      />
    );
  }

  // ──── CHECKOUT FORM ────
  return (
    <form
      id="checkout-form"
      ref={formRef}
      onSubmit={(e) => {
        syncAutofill();
        handleSubmit(onSubmit)(e);
      }}
      className={className || ""}>
      {(!isLoggedIn || user?.role !== "customer") && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-primary">Login to place your order.</p>
          <Button className="mt-2 bg-[#D2691E] hover:bg-[#A0522D] text-white border-0 text-xs" asChild>
            <Link to={`/login?redirect=${encodeURIComponent("/checkout")}`}>Login to Continue</Link>
          </Button>
        </div>
      )}

      {/* ═══════ CONTACT INFO ═══════ */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4 shadow-sm mb-4">
        <h2 className="font-bold text-foreground flex items-center gap-2 text-sm sm:text-base">
          <User className="h-4 w-4 text-primary" /> Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RHFField label="First Name" name="firstName" register={register} errors={errors} required placeholder="John" setValue={setValue} />
          <RHFField label="Last Name" name="lastName" register={register} errors={errors} required placeholder="Doe" setValue={setValue} />
          <div className="sm:col-span-2">
            <RHFField label="Email Address" name="email" register={register} errors={errors} required placeholder="john@example.com" type="email" setValue={setValue} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">
              Phone Number <span className="text-danger">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                {...register("countryCode")}
                className="w-24 sm:w-28 border border-input rounded-lg px-2 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <div className="flex-1">
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="9876543210"
                  className={`text-sm ${errors.phone ? "border-danger" : ""}`}
                />
              </div>
            </div>
            {errors.phone && <p className="text-[11px] text-danger mt-1">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* ═══════ SHIPPING ADDRESS ═══════ */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 text-primary" /> Shipping Address
          </h2>
          <Button
            type="button" variant="outline" size="sm"
            onClick={getLocationByGPS} disabled={locating}
            className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 text-xs shrink-0"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
            {locating ? "Detecting..." : "Use GPS"}
          </Button>
        </div>

        <div className="space-y-1">
          <Label htmlFor="line1" className="text-xs sm:text-sm font-medium">
            Address Line 1 <span className="text-danger">*</span>
          </Label>
          {mapsReady ? (
            <input
              id="line1"
              name="line1"
              placeholder="Start typing your address..."
              className={`w-full border ${errors.line1 ? "border-danger" : "border-input"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
              ref={(el) => {
                register("line1").ref(el);
                initAutocomplete(el);
              }}
              onInput={(e) => setValue("line1", e.target.value, { shouldValidate: false })}
              onChange={(e) => {
                register("line1").onChange(e);
                clearLocation();
              }}
              onBlur={register("line1").onBlur}
            />
          ) : (
            <input
              id="line1"
              name="line1"
              placeholder="Enter your full address (street, area, landmark)"
              className={`w-full border ${errors.line1 ? "border-danger" : "border-input"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
              {...register("line1")}
              onInput={(e) => setValue("line1", e.target.value, { shouldValidate: false })}
              onChange={(e) => {
                register("line1").onChange(e);
                clearLocation();
              }}
            />
          )}
          {errors.line1 && <p className="text-[11px] text-danger">{errors.line1.message}</p>}
        </div>

        <RHFField label="Address Line 2 (optional)" name="line2" register={register} errors={errors} placeholder="Apartment, suite, etc." setValue={setValue} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RHFField label="City" name="city" register={register} errors={errors} required placeholder="Mumbai" setValue={setValue} />
          <RHFField label="State" name="state" register={register} errors={errors} required placeholder="Maharashtra" setValue={setValue} />
          <RHFField label="Postal Code" name="postalCode" register={register} errors={errors} required placeholder="400001" setValue={setValue} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="country" className="text-xs sm:text-sm font-medium">Country</Label>
          <select
            id="country"
            {...register("country")}
            className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Live distance display */}
        {distanceLoading && (
          <div className="bg-muted border border-border rounded-lg p-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Calculating delivery distance...
          </div>
        )}
        {distanceError && !distanceLoading && (
          <div className="bg-warning-subtle border border-warning/30 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-warning">{distanceError}</p>
            <div className="mt-2">
              <CheckoutIssueButton
                orderId={null}
                userName={`${watch("firstName") || ""} ${watch("lastName") || ""}`.trim()}
                customerPhone={watch("phone")}
                customerEmail={watch("email")}
                defaultIssueType="delivery"
                defaultDescription={`Distance calculation error: ${distanceError}`}
                buttonLabel="Report Delivery Issue"
                buttonClassName="border-warning/40 text-warning hover:bg-warning-subtle gap-1.5 text-xs"
              />
            </div>
          </div>
        )}
        {delivery && !distanceLoading && (
          <>
            {delivery.isDeliverable ? (
              <div className="bg-success-subtle border border-success/30 rounded-lg p-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                <span className="text-success font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {delivery.distanceKm} km from store
                </span>
                <span className="text-success/70 hidden sm:inline">|</span>
                <span className="text-success flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> ~{delivery.durationMinutes} min
                </span>
                <span className="text-success/70 hidden sm:inline">|</span>
                <span className="text-success flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> ₹{delivery.deliveryCharge} charge
                </span>
              </div>
            ) : (
              <div className="bg-danger-subtle border-2 border-danger/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-danger text-sm">Sorry, we do not currently deliver to your location.</p>
                    <p className="text-xs text-danger mt-0.5">
                      Your location is {delivery.distanceKm} km away (max 20 km delivery area).
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <CheckoutIssueButton
                    orderId={null}
                    userName={`${watch("firstName") || ""} ${watch("lastName") || ""}`.trim()}
                    customerPhone={watch("phone")}
                    customerEmail={watch("email")}
                    defaultIssueType="delivery"
                    defaultDescription={`My address is ${delivery.distanceKm} km from the store, beyond the delivery area. Can you help?`}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════ BILLING ADDRESS ═══════ */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4 shadow-sm mb-4">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowBilling((p) => !p)}
        >
          <h2 className="font-bold text-foreground text-sm sm:text-base">Billing Address</h2>
          {showBilling ? <ChevronUp className="h-4 w-4 text-muted-foreground/70" /> : <ChevronDown className="h-4 w-4 text-muted-foreground/70" />}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsShipping}
            {...register("sameAsShipping")}
            onChange={() => { setValue("sameAsShipping", !sameAsShipping); setShowBilling(true); }}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm text-muted-foreground">Same as shipping address</span>
        </label>

        {showBilling && !sameAsShipping && (
          <div className="space-y-3 pt-2 border-t border-border">
            <RHFField label="Address Line 1" name="billingLine1" register={register} errors={errors} placeholder="Start typing..." setValue={setValue} />
            <RHFField label="Address Line 2 (optional)" name="billingLine2" register={register} errors={errors} placeholder="Apartment, suite" setValue={setValue} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RHFField label="City" name="billingCity" register={register} errors={errors} placeholder="Mumbai" setValue={setValue} />
              <RHFField label="State" name="billingState" register={register} errors={errors} placeholder="Maharashtra" setValue={setValue} />
              <RHFField label="Postal Code" name="billingPostalCode" register={register} errors={errors} placeholder="400001" setValue={setValue} />
            </div>
          </div>
        )}
      </div>

      {/* ═══════ ORDER NOTES ═══════ */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm mb-4">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowNotes((p) => !p)}
        >
          <h2 className="font-bold text-foreground flex items-center gap-2 text-sm sm:text-base">
            <FileText className="h-4 w-4 text-primary" /> Order Notes
          </h2>
          {showNotes ? <ChevronUp className="h-4 w-4 text-muted-foreground/70" /> : <ChevronDown className="h-4 w-4 text-muted-foreground/70" />}
        </div>
        {showNotes && (
          <textarea
            {...register("orderNotes")}
            placeholder="Delivery instructions, gate code, landmark, etc."
            rows={3}
            className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mt-3"
          />
        )}
      </div>

      {/* ═══════ PAYMENT METHOD ═══════ */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-3 shadow-sm mb-4">
        <h2 className="font-bold text-foreground flex items-center gap-2 text-sm sm:text-base">
          <CreditCard className="h-4 w-4 text-primary" /> Payment Method
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { value: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
            { value: "online", label: "Online Payment", icon: CreditCard, desc: "Credit/Debit card, UPI" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("paymentMethod", opt.value)}
              className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                paymentMethod === opt.value
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-surface hover:border-input"
              }`}
            >
              <div className="flex items-center gap-2">
                <opt.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ ORDER SUMMARY ═══════ */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm mb-4">
        <h3 className="font-bold text-foreground text-sm sm:text-base mb-3">Order Summary</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 mb-3">
          {cart?.items?.map((item) => (
            <div key={item._id || item.product?._id} className="flex justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground truncate">
                {item.product?.name}{item.variant ? ` (${item.variant})` : ""} × {item.quantity}
              </span>
              <span className="text-foreground font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-2" />
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span>Delivery {delivery?.distanceKm ? `(${delivery.distanceKm} km)` : ""}</span>
            <span>{delivery?.deliveryCharge ? formatPrice(delivery.deliveryCharge) : "—"}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-sm sm:text-base">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
          {walletApplied > 0 && (
            <>
              <div className="flex justify-between text-xs sm:text-sm text-success font-medium">
                <span>Wallet credit</span>
                <span>−{formatPrice(walletApplied)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm sm:text-base">
                <span className="text-foreground">To pay</span>
                <span className="text-primary">{formatPrice(payableAfterWallet)}</span>
              </div>
            </>
          )}
        </div>

        {walletBalance > 0 && (
          <button
            type="button"
            onClick={() => setUseWalletCredit((v) => !v)}
            className={`mt-3 w-full flex items-center justify-between gap-2 rounded-xl border-2 p-3 text-left transition-all ${
              useWalletCredit ? "border-success bg-success-subtle" : "border-border hover:border-input"
            }`}
          >
            <span className="flex items-center gap-2 text-sm">
              <Wallet className={`h-4 w-4 ${useWalletCredit ? "text-success" : "text-muted-foreground/70"}`} />
              <span className="font-medium text-foreground">Use wallet balance</span>
              <span className="text-muted-foreground/70">({formatPrice(walletBalance)} available)</span>
            </span>
            <span className={`h-5 w-9 rounded-full transition-colors relative shrink-0 ${useWalletCredit ? "bg-success" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface transition-all ${useWalletCredit ? "left-4.5" : "left-0.5"}`} style={{ left: useWalletCredit ? "1.125rem" : "0.125rem" }} />
            </span>
          </button>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={placeOrder?.isPending || (delivery && !delivery.isDeliverable)}
        className="w-full bg-gradient-to-r from-[#D2691E] to-[#E8A04F] hover:from-[#A0522D] hover:to-[#D2691E] text-white border-0 shadow-lg shadow-orange-500/20 text-sm sm:text-base font-bold py-4 rounded-xl"
      >
        {placeOrder?.isPending ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</span>
        ) : delivery && !delivery.isDeliverable ? (
          "Address Outside Delivery Area"
        ) : !coordinates && mapsAvailable ? (
          "Select a Valid Address"
        ) : (
          `Place Order — ${formatPrice(total)}`
        )}
      </Button>
    </form>
  );
};

export default CheckoutForm;
