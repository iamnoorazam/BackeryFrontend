import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/atoms/ThemeToggle";

const AuthLayout = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface-2 p-4">
    {/* Ambient brand glow */}
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand-2/10 rounded-full blur-3xl" />
    </div>

    <div className="fixed top-4 right-4 z-20">
      <ThemeToggle />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md relative z-10"
    >
      <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-3xl shadow-elevated p-6 sm:p-8">
        <Outlet />
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        &copy; {new Date().getFullYear()}{" "}
        <Link to="/" className="hover:text-foreground transition-colors font-medium">
          Saffron &amp; Silk
        </Link>
        . All rights reserved.
      </p>
    </motion.div>
  </div>
);

export default AuthLayout;
