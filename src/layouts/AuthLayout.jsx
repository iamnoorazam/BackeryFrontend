import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";

const AuthLayout = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/30 p-4">
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-3xl" />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md relative z-10"
    >
      <div className="bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-3xl shadow-soft p-6 sm:p-8">
        <Outlet />
      </div>

      <p className="text-center text-xs text-stone-400 mt-6">
        &copy; {new Date().getFullYear()}{" "}
        <Link to="/" className="hover:text-stone-600 transition-colors font-medium">ApnaMart</Link>
        . All rights reserved.
      </p>
    </motion.div>
  </div>
);

export default AuthLayout;
