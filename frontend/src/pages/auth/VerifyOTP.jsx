import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FormField from "@/components/molecules/FormField";
import { authApi } from "@/api/auth.api";
import { useToast } from "../../store/Toast";

const VerifyOTP = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("email"); // email, otp, reset

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep("otp");
    } catch (err) {
      toast({ title: err.response?.data?.message || "Error sending OTP", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.verifyOTP({ email, otp });
      localStorage.setItem("resetToken", response.data.data.resetToken);
      setStep("reset");
    } catch (err) {
      toast({ title: err.response?.data?.message || "Invalid OTP", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resetToken = localStorage.getItem("resetToken");
      const password = e.target.password.value;
      await authApi.resetPassword({ token: resetToken, password });
      toast({ title: "Password reset successful", variant: "success" });
      window.location.href = "/login";
    } catch (err) {
      toast({ title: err.response?.data?.message || "Error resetting password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your email to receive OTP</p>
        </div>
        <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>
        <p className="text-sm text-center">
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Verify OTP</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit OTP sent to {email}</p>
        </div>
        <FormField
          label="OTP"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          required
          pattern="[0-9]{6}"
          title="Enter a 6-digit OTP"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
        <p className="text-sm text-center">
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </form>
    );
  }

  // Reset password step
  return (
    <form onSubmit={handleResetSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new password</p>
      </div>
      <FormField
        label="New Password"
        type="password"
        name="password"
        placeholder="Enter new password"
        required
      />
      <FormField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="Confirm new password"
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
      <p className="text-sm text-center">
        <Link to="/login" className="text-primary hover:underline">Back to login</Link>
      </p>
    </form>
  );
};

export default VerifyOTP;