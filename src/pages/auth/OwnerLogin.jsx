import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/authStore";
import { motion } from "framer-motion";

const OwnerLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await adminLogin({ email: email.trim(), password });
      navigate("/owner/dashboard");
    } catch {
      setError("Invalid email or password");
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
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/20"
        >
          <Store className="h-6 w-6 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-stone-900">Owner Login</h1>
        <p className="text-sm text-stone-500 mt-1">Sign in to manage your store</p>
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

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-stone-700">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="owner@bakery.com"
          className="h-11 rounded-xl bg-white border-2 border-stone-200 focus-visible:border-orange-400"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-semibold text-stone-700">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          placeholder="••••••••"
          className="h-11 rounded-xl bg-white border-2 border-stone-200 focus-visible:border-orange-400"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all duration-300 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Login"
        )}
      </Button>
    </motion.form>
  );
};

export default OwnerLogin;
