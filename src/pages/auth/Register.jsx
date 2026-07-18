import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, User, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";
import { motion } from "framer-motion";

const strengthColors = { weak: "bg-danger-subtle0", medium: "bg-amber-500", strong: "bg-emerald-500" };
const strengthLabels = { weak: "Weak", medium: "Medium", strong: "Strong" };

const getStrength = (pw) => {
  if (!pw) return null;
  if (pw.length < 6) return "weak";
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) return "medium";
  return "strong";
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { showToast } = useToast();
  const redirect = new URLSearchParams(location.search).get("redirect");

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(form.password);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: "customer" });
      showToast({ title: "Account created!", description: "Welcome! Start ordering now 🎉" });
      navigate(redirect || "/");
    } catch (err) {
      setApiError(err.userMessage || err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    { label: "Contains a number", met: /[0-9]/.test(form.password) },
    { label: "Contains a capital letter", met: /[A-Z]/.test(form.password) },
  ];

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
          <UserPlus className="h-6 w-6 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join us to start ordering your favourites</p>
      </div>

      {apiError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-danger-subtle border border-danger/30 text-danger text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-danger-subtle0 shrink-0" />{apiError}
        </motion.div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
          <Input id="name" value={form.name} onChange={set("name")} placeholder="John Doe" className={`pl-10 ${errors.name ? "border-danger/50" : ""}`} />
        </div>
        {errors.name && <p className="text-xs text-danger font-medium">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
          <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" className={`pl-10 ${errors.email ? "border-danger/50" : ""}`} />
        </div>
        {errors.email && <p className="text-xs text-danger font-medium">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
          <Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="••••••••" className={`pl-10 pr-11 ${errors.password ? "border-danger/50" : ""}`} />
          <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors" tabIndex={-1}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-danger font-medium">{errors.password}</p>}
        {form.password && (
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full ${strengthColors[strength] || "bg-muted"}`} />
              <span className="text-[10px] font-semibold text-muted-foreground capitalize">{strengthLabels[strength]}</span>
            </div>
            <div className="space-y-1">
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-1.5 text-[11px]">
                  {req.met ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <X className="h-3 w-3 text-muted-foreground/50" />
                  )}
                  <span className={req.met ? "text-muted-foreground" : "text-muted-foreground/70"}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
          <Input id="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" className={`pl-10 pr-11 ${errors.confirmPassword ? "border-danger/50" : ""}`} />
          <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors" tabIndex={-1}>
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-danger font-medium">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" disabled={loading} variant="premium" size="lg" className="w-full">
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</span>
        ) : "Create Account"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"} className="text-[#D2691E] hover:text-[#A0522D] font-semibold transition-colors">Sign in</Link>
      </p>

      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>
      </div>
    </motion.form>
  );
};

export default Register;
