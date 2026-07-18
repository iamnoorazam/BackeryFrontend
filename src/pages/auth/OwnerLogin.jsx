import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2691E]/20"
        >
          <Store className="h-6 w-6 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Owner Login</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage your store</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger-subtle border border-danger/30 text-danger text-sm rounded-xl px-4 py-3 text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="owner@bakery.com"
          className="h-11 rounded-xl bg-card border-2 border-border focus-visible:border-[#D2691E]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-semibold text-foreground">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="••••••••"
          className="h-11 rounded-xl bg-card border-2 border-border focus-visible:border-[#D2691E]"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] hover:from-[#A0522D] hover:to-[#D2691E] text-white font-bold text-sm shadow-lg shadow-[#D2691E]/20 transition-all duration-300 disabled:opacity-60"
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

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/merchant/register" className="font-semibold text-[#D2691E] hover:underline">
          Become a merchant
        </Link>
      </p>
    </motion.form>
  );
};

export default OwnerLogin;
