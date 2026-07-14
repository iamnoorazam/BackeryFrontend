import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/auth.api";
import { useToast } from "@/store/Toast";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email"); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      showToast({ title: "OTP Sent", description: "Check your email for the OTP" });
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      showToast({ title: "Error", description: err.response?.data?.message || "Error sending OTP", variant: "destructive" });
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
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20"
        >
          <KeyRound className="h-6 w-6 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-stone-900">Forgot Password</h1>
        <p className="text-sm text-stone-500 mt-1">Enter your email to receive a password reset OTP</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-stone-700">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
            placeholder="john@example.com"
            className={`pl-10 h-11 rounded-xl bg-white border-2 transition-all ${
              error ? "border-red-300 focus-visible:ring-red-400" : "border-stone-200 focus-visible:border-orange-400"
            }`}
          />
        </div>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500" /> {error}
          </motion.p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all duration-300 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...</span>
        ) : "Send OTP"}
      </Button>

      <div className="text-center space-y-2">
        <Link to="/login" className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to login
        </Link>
      </div>
    </motion.form>
  );
};

export default ForgotPassword;
