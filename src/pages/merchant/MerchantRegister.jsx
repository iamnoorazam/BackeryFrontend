import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";

const STORE_TYPES = [
  { value: "food", label: "Food / Restaurant" },
  { value: "fashion", label: "Fashion / Boutique" },
  { value: "grocery", label: "Grocery" },
  { value: "other", label: "Other" },
];

const MerchantRegister = () => {
  const navigate = useNavigate();
  const { merchantRegister } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    restaurantName: "",
    storeType: "food",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.ownerName.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.restaurantName.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await merchantRegister({
        ownerName: form.ownerName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        restaurantName: form.restaurantName.trim(),
        storeType: form.storeType,
      });
      toast({ title: "Welcome aboard!", description: "Now complete your KYC to go live." });
      navigate("/merchant/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2691E]/20"
        >
          <Store className="h-6 w-6 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-stone-900">Become a Merchant</h1>
        <p className="text-sm text-stone-500 mt-1">Register your store and start selling</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center"
        >
          {error}
        </motion.div>
      )}

      <Field label="Store / Restaurant name *" htmlFor="restaurantName">
        <Input
          id="restaurantName"
          value={form.restaurantName}
          onChange={set("restaurantName")}
          placeholder="Saffron & Silk"
          className={inputCls}
        />
      </Field>

      <Field label="Store type" htmlFor="storeType">
        <select
          id="storeType"
          value={form.storeType}
          onChange={set("storeType")}
          className={`${inputCls} px-3`}
        >
          {STORE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Owner name *" htmlFor="ownerName">
        <Input
          id="ownerName"
          value={form.ownerName}
          onChange={set("ownerName")}
          placeholder="Your full name"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Email *" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@store.com"
            className={inputCls}
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+91…"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Password *" htmlFor="password">
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="••••••••"
          className={inputCls}
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] hover:from-[#A0522D] hover:to-[#D2691E] text-white font-bold text-sm shadow-lg shadow-[#D2691E]/20 transition-all duration-300 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account…
          </span>
        ) : (
          "Create merchant account"
        )}
      </Button>

      <p className="text-center text-sm text-stone-500">
        Already a merchant?{" "}
        <Link to="/owner/login" className="font-semibold text-[#D2691E] hover:underline">
          Sign in
        </Link>
      </p>
    </motion.form>
  );
};

const inputCls =
  "h-11 rounded-xl bg-white border-2 border-stone-200 focus-visible:border-[#D2691E] w-full";

const Field = ({ label, htmlFor, children }) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-sm font-semibold text-stone-700">
      {label}
    </Label>
    {children}
  </div>
);

export default MerchantRegister;
