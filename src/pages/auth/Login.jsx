import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/authStore";
import { useToast, TOAST_MESSAGES } from "@/store/Toast";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const redirect = new URLSearchParams(location.search).get("redirect");

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");

    try {
      const user = await login({ email: form.email, password: form.password });
      if (user.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }
      if (user.role === "delivery") {
        navigate("/delivery/dashboard");
        return;
      }
      showToast(TOAST_MESSAGES.SUCCESS.LOGIN);
      navigate(redirect || "/");
    } catch (err) {
      setApiError(err.userMessage || err.response?.data?.message || "Invalid email or password");
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
      className="space-y-5"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2691E]/20"
        >
          <LogIn className="h-6 w-6 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/70">
          <span>
            <strong className="text-muted-foreground">Demo:</strong> Register below or sign in with your
            account
          </span>
        </div>
      </div>

      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger-subtle border border-danger/30 text-danger text-sm rounded-2xl px-4 py-3 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-danger-subtle0 shrink-0" />
          {apiError}
        </motion.div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="john@example.com"
            className={`pl-10 ${errors.email ? "border-danger/50 focus:border-danger focus:ring-danger/10" : ""}`}
          />
        </div>
        {errors.email && <p className="text-xs text-danger font-medium">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
            className={`pl-10 pr-11 ${errors.password ? "border-danger/50 focus:border-danger focus:ring-danger/10" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-danger font-medium">{errors.password}</p>}
      </div>

      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-xs font-medium text-[#D2691E] hover:text-[#A0522D] transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" disabled={loading} variant="premium" size="lg" className="w-full">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground/70 font-medium">or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => showToast({ title: "Google login coming soon" })}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
          className="text-[#D2691E] hover:text-[#A0522D] font-semibold transition-colors"
        >
          Create one
        </Link>
      </p>

      <p className="text-xs text-center text-muted-foreground/70">
        Want to deliver with us?{" "}
        <Link to="/delivery/register" className="font-semibold text-[#0F766E] hover:underline">
          Become a delivery partner
        </Link>
      </p>

      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>
      </div>
    </motion.form>
  );
};

export default Login;
