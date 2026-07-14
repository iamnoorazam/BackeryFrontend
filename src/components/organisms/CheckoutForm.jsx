import { useState, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/store/Toast";
import { deliveryApi } from "@/api/delivery.api";
import { formatPrice } from "@/lib/utils";
import { useLoadScript } from "@react-google-maps/api";
import {
  MapPin, Navigation, Loader2, CheckCircle, AlertTriangle, CreditCard, Banknote,
  ChevronDown, ChevronUp, Phone, Mail, User, FileText, Crosshair, Truck, Clock
} from "lucide-react";

const libraries = ["places"];

const COUNTRY_CODES = [
  { code: "+91", label: "IN +91" },
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+971", label: "AE +971" },
  { code: "+65", label: "SG +65" },
  { code: "+852", label: "HK +852" },
  { code: "+86", label: "CN +86" },
  { code: "+81", label: "JP +81" },
];

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "CA", name: "Canada" },
];

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  countryCode: yup.string().default("+91"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^\d{6,15}$/, "Enter a valid phone number"),
  line1: yup.string().required("Address is required"),
  line2: yup.string().default(""),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  postalCode: yup
    .string()
    .required("Postal code is required")
    .matches(/^\d{4,10}$/, "Invalid postal code"),
  country: yup.string().default("IN"),
  billingLine1: yup.string(),
  billingLine2: yup.string(),
  billingCity: yup.string(),
  billingState: yup.string(),
  billingPostalCode: yup.string(),
  billingCountry: yup.string().default("IN"),
  sameAsShipping: yup.boolean().default(true),
  orderNotes: yup.string().default(""),
  paymentMethod: yup.string().oneOf(["cod", "online"]).default("cod"),
});

const FormField = ({ label, name, register, errors, required, placeholder, className, disabled, type, setValue }) => (
  <div className="space-y-1">
    <Label htmlFor={name} className="text-xs sm:text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      id={name}
      type={type || "text"}
      {...register(name)}
      placeholder={placeholder || ""}
      className={`text-sm ${errors[name] ? "border-red-400 ring-red-400" : ""} ${className || ""}`}
      disabled={disabled}
      onInput={setValue ? (e) => setValue(name, e.target.value, { shouldValidate: false }) : undefined}
    />
    {errors[name] && <p className="text-[11px] text-red-500">{errors[name].message}</p>}
  </div>
);

const CheckoutForm = ({ cart, user, isLoggedIn, placeOrder, onOrderSuccess, onOrderError, onViewOrders, onContinueShopping, className }) => {
  const { toast } = useToast();
  const [locating, setLocating] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const [distanceError, setDistanceError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [showBilling, setShowBilling] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);
  const distanceTimerRef = useRef(null);

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

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapsAvailable = mapsKey && mapsKey !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey,
    libraries,
  });
  const mapsReady = mapsAvailable && isLoaded;

  const subtotal = cart?.totalPrice || 0;
  const total = subtotal + (delivery?.deliveryCharge || 0);

  const fetchDistance = useCallback(async (lat, lng) => {
    setDistanceLoading(true);
    setDistanceError("");
    try {
      const res = await deliveryApi.getDistance({ lat, lng });
      setDelivery(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.userMessage || "Could not calculate delivery distance";
      console.error("[CheckoutForm] Distance fetch failed:", msg, err.response?.data || err.message);
      setDistanceError(msg);
    } finally {
      setDistanceLoading(false);
    }
  }, []);

  const debouncedFetchDistance = useCallback((lat, lng) => {
    if (distanceTimerRef.current) clearTimeout(distanceTimerRef.current);
    distanceTimerRef.current = setTimeout(() => fetchDistance(lat, lng), 600);
  }, [fetchDistance]);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;

    const addr = place.address_components || [];
    const get = (type) => addr.find((c) => c.types.includes(type))?.long_name || "";
    const getShort = (type) => addr.find((c) => c.types.includes(type))?.short_name || "";

    const newLine1 = `${get("street_number") ? get("street_number") + " " : ""}${get("route") || get("sublocality") || get("locality") || place.formatted_address || ""}`.trim();
    const newCity = get("locality") || get("sublocality") || get("postal_town") || "";
    const newState = get("administrative_area_level_1") || "";
    const newPostalCode = get("postal_code") || "";
    const newCountry = getShort("country") || "IN";
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setValue("line1", newLine1);
    setValue("city", newCity);
    setValue("state", newState);
    setValue("postalCode", newPostalCode);
    setValue("country", newCountry);
    setCoordinates({ lat, lng });
    debouncedFetchDistance(lat, lng);
  };

  const initAutocomplete = (el) => {
    if (!el || !window.google?.maps?.places) return;
    if (addressInputRef.current === el) return;
    addressInputRef.current = el;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(el, {
      types: ["address"],
      componentRestrictions: { country: "in" },
      fields: ["address_components", "geometry", "formatted_address", "name"],
    });
    autocompleteRef.current.addListener("place_changed", onPlaceChanged);
  };

  const getLocationByGPS = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoordinates({ lat, lng });
        try {
          const res = await deliveryApi.getDistance({ lat, lng });
          setDelivery(res.data.data);
        } catch (err) {
          const msg = err.response?.data?.message || err.userMessage || "Could not calculate delivery";
          console.error("[CheckoutForm] GPS distance fetch failed:", msg, err.response?.data || err.message);
          setDistanceError(msg);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({ title: "GPS failed. Enter your address manually.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
    };

    try {
      const res = await placeOrder.mutateAsync(payload);
      const orderData = res?.data?.data || res?.data || res;
      const o = orderData?._id ? orderData : (res?.data?.data || {});
      const result = {
        id: o._id || "N/A",
        name: o.customerName || name,
        address: o.deliveryAddress?.fullAddress || `${formData.line1}, ${formData.city}`,
        distance: o.deliveryDistance || 0,
        time: o.estimatedDeliveryTime || "Calculating...",
        charge: o.deliveryCharge || 0,
        total: o.totalPrice || total,
      };
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
      <div className={`animate-fade-in ${className || ""}`}>
        <div className="bg-white border-2 border-green-200 rounded-xl p-6 sm:p-8 text-center shadow-lg max-w-lg mx-auto">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-1">Order Placed Successfully!</h2>
          <p className="text-xs text-stone-400 mb-1">Order #{orderResult.id.toString().slice(-8).toUpperCase()}</p>
          <p className="text-sm text-stone-500 mb-6">Thank you, {orderResult.name}!</p>

          <div className="bg-stone-50 rounded-xl p-4 text-left space-y-2 text-sm border border-stone-200">
            <h3 className="font-semibold text-stone-900 mb-2">Delivery Details</h3>
            <p className="text-stone-600"><span className="font-medium text-stone-900">Address:</span> {orderResult.address}</p>
            <p className="text-stone-600"><span className="font-medium text-stone-900">Distance from our store:</span> {orderResult.distance} km</p>
            <p className="text-stone-600"><span className="font-medium text-stone-900">Estimated delivery time:</span> {orderResult.time}</p>
            <p className="text-stone-600"><span className="font-medium text-stone-900">Delivery charge:</span> ₹{orderResult.charge}</p>
            <Separator className="my-2" />
            <p className="text-stone-600"><span className="font-medium text-stone-900">Total paid:</span> ₹{orderResult.total}</p>
          </div>

          <div className="mt-6 flex gap-3">
            {onViewOrders ? (
              <Button type="button" className="flex-1" onClick={onViewOrders}>View Orders</Button>
            ) : (
              <Button type="button" className="flex-1" onClick={() => window.location.href = "/orders"}>View Orders</Button>
            )}
            {onContinueShopping ? (
              <Button type="button" variant="outline" className="flex-1" onClick={onContinueShopping}>Continue Shopping</Button>
            ) : (
              <Button type="button" variant="outline" className="flex-1" onClick={() => window.location.href = "/products"}>Continue Shopping</Button>
            )}
          </div>
        </div>
      </div>
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
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-orange-800">Login to place your order.</p>
          <Button className="mt-2 bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs" asChild>
            <Link to={`/login?redirect=${encodeURIComponent("/checkout")}`}>Login to Continue</Link>
          </Button>
        </div>
      )}

      {/* ═══════ CONTACT INFO ═══════ */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm mb-4">
        <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-base">
          <User className="h-4 w-4 text-orange-500" /> Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="First Name" name="firstName" register={register} errors={errors} required placeholder="John" setValue={setValue} />
          <FormField label="Last Name" name="lastName" register={register} errors={errors} required placeholder="Doe" setValue={setValue} />
          <div className="sm:col-span-2">
            <FormField label="Email Address" name="email" register={register} errors={errors} required placeholder="john@example.com" type="email" setValue={setValue} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                {...register("countryCode")}
                className="w-24 sm:w-28 border border-stone-300 rounded-lg px-2 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className={`text-sm ${errors.phone ? "border-red-400" : ""}`}
                />
              </div>
            </div>
            {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* ═══════ SHIPPING ADDRESS ═══════ */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 text-orange-500" /> Shipping Address
          </h2>
          <Button
            type="button" variant="outline" size="sm"
            onClick={getLocationByGPS} disabled={locating}
            className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-1.5 text-xs shrink-0"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
            {locating ? "Detecting..." : "Use GPS"}
          </Button>
        </div>

        <div className="space-y-1">
          <Label htmlFor="line1" className="text-xs sm:text-sm font-medium">
            Address Line 1 <span className="text-red-500">*</span>
          </Label>
          {mapsReady ? (
            <input
              id="line1"
              name="line1"
              placeholder="Start typing your address..."
              className={`w-full border ${errors.line1 ? "border-red-400" : "border-stone-300"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
              ref={(el) => {
                register("line1").ref(el);
                initAutocomplete(el);
              }}
              onInput={(e) => setValue("line1", e.target.value, { shouldValidate: false })}
              onChange={(e) => {
                register("line1").onChange(e);
                setCoordinates(null);
                setDelivery(null);
              }}
              onBlur={register("line1").onBlur}
            />
          ) : (
            <input
              id="line1"
              name="line1"
              placeholder="Enter your full address (street, area, landmark)"
              className={`w-full border ${errors.line1 ? "border-red-400" : "border-stone-300"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
              {...register("line1")}
              onInput={(e) => setValue("line1", e.target.value, { shouldValidate: false })}
              onChange={(e) => {
                register("line1").onChange(e);
                setCoordinates(null);
                setDelivery(null);
              }}
            />
          )}
          {errors.line1 && <p className="text-[11px] text-red-500">{errors.line1.message}</p>}
        </div>

        <FormField label="Address Line 2 (optional)" name="line2" register={register} errors={errors} placeholder="Apartment, suite, etc." setValue={setValue} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="City" name="city" register={register} errors={errors} required placeholder="Mumbai" setValue={setValue} />
          <FormField label="State" name="state" register={register} errors={errors} required placeholder="Maharashtra" setValue={setValue} />
          <FormField label="Postal Code" name="postalCode" register={register} errors={errors} required placeholder="400001" setValue={setValue} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="country" className="text-xs sm:text-sm font-medium">Country</Label>
          <select
            id="country"
            {...register("country")}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Live distance display */}
        {distanceLoading && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center gap-2 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Calculating delivery distance...
          </div>
        )}
        {distanceError && !distanceLoading && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs sm:text-sm text-amber-700">
            {distanceError}
          </div>
        )}
        {delivery && !distanceLoading && (
          <>
            {delivery.isDeliverable ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                <span className="text-green-800 font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {delivery.distanceKm} km from store
                </span>
                <span className="text-green-600 hidden sm:inline">|</span>
                <span className="text-green-700 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> ~{delivery.durationMinutes} min
                </span>
                <span className="text-green-600 hidden sm:inline">|</span>
                <span className="text-green-700 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> ₹{delivery.deliveryCharge} charge
                </span>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 text-sm">Sorry, we do not currently deliver to your location.</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Your location is {delivery.distanceKm} km away (max 20 km delivery area).
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════ BILLING ADDRESS ═══════ */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm mb-4">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowBilling((p) => !p)}
        >
          <h2 className="font-bold text-stone-900 text-sm sm:text-base">Billing Address</h2>
          {showBilling ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsShipping}
            {...register("sameAsShipping")}
            onChange={() => { setValue("sameAsShipping", !sameAsShipping); setShowBilling(true); }}
            className="accent-orange-500 w-4 h-4"
          />
          <span className="text-sm text-stone-600">Same as shipping address</span>
        </label>

        {showBilling && !sameAsShipping && (
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <FormField label="Address Line 1" name="billingLine1" register={register} errors={errors} placeholder="Start typing..." setValue={setValue} />
            <FormField label="Address Line 2 (optional)" name="billingLine2" register={register} errors={errors} placeholder="Apartment, suite" setValue={setValue} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="City" name="billingCity" register={register} errors={errors} placeholder="Mumbai" setValue={setValue} />
              <FormField label="State" name="billingState" register={register} errors={errors} placeholder="Maharashtra" setValue={setValue} />
              <FormField label="Postal Code" name="billingPostalCode" register={register} errors={errors} placeholder="400001" setValue={setValue} />
            </div>
          </div>
        )}
      </div>

      {/* ═══════ ORDER NOTES ═══════ */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-sm mb-4">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowNotes((p) => !p)}
        >
          <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-base">
            <FileText className="h-4 w-4 text-orange-500" /> Order Notes
          </h2>
          {showNotes ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
        </div>
        {showNotes && (
          <textarea
            {...register("orderNotes")}
            placeholder="Delivery instructions, gate code, landmark, etc."
            rows={3}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mt-3"
          />
        )}
      </div>

      {/* ═══════ PAYMENT METHOD ═══════ */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm mb-4">
        <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-base">
          <CreditCard className="h-4 w-4 text-orange-500" /> Payment Method
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
                  ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <opt.icon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-bold text-stone-900">{opt.label}</p>
                  <p className="text-[11px] text-stone-500">{opt.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ ORDER SUMMARY ═══════ */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-sm mb-4">
        <h3 className="font-bold text-stone-900 text-sm sm:text-base mb-3">Order Summary</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 mb-3">
          {cart?.items?.map((item) => (
            <div key={item._id || item.product?._id} className="flex justify-between text-xs sm:text-sm gap-2">
              <span className="text-stone-600 truncate">
                {item.product?.name}{item.variant ? ` (${item.variant})` : ""} × {item.quantity}
              </span>
              <span className="text-stone-900 font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-2" />
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs sm:text-sm text-stone-500">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-stone-500">
            <span>Delivery {delivery?.distanceKm ? `(${delivery.distanceKm} km)` : ""}</span>
            <span>{delivery?.deliveryCharge ? formatPrice(delivery.deliveryCharge) : "—"}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-sm sm:text-base">
            <span className="text-stone-900">Total</span>
            <span className="text-orange-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={placeOrder?.isPending || (delivery && !delivery.isDeliverable)}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg shadow-orange-500/20 text-sm sm:text-base font-bold py-4 rounded-xl"
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
