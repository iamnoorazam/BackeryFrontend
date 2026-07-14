import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/auth.api";
import { useToast } from "@/store/Toast";
import { motion } from "framer-motion";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const { showToast } = useToast();

  const [step, setStep] = useState("otp");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef([]);

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter the full 6-digit OTP"); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.verifyOTP(email, code);
      setStep("reset");
      showToast({ title: "OTP Verified", description: "Now set your new password" });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(email, otp.join(""), newPassword);
      showToast({ title: "Password Reset", description: "Login with your new password" });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="text-center py-8">
        <p className="text-stone-500 mb-4">No email provided. Please start again.</p>
        <Button asChild><Link to="/forgot-password">Forgot Password</Link></Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {step === "otp" ? (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20"
            >
              <ShieldCheck className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-stone-900">Verify OTP</h1>
            <p className="text-sm text-stone-500 mt-1">Enter the 6-digit code sent to {email}</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-stone-700 block text-center">OTP Code</Label>
            <div className="flex justify-center gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading || otp.join("").length !== 6} className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg disabled:opacity-60">
            {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</span> : "Verify OTP"}
          </Button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-xs font-medium text-orange-600 hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Try again
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Set New Password</h1>
            <p className="text-sm text-stone-500 mt-1">Choose a strong password for your account</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm font-semibold text-stone-700">New Password</Label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border-2 border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-stone-700">Confirm Password</Label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border-2 border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg disabled:opacity-60">
            {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</span> : "Reset Password"}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-xs font-medium text-orange-600 hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to login
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default VerifyOTP;
