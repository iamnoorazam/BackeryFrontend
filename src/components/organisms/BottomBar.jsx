import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, LayoutGrid, User, Shirt } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/store/authStore";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/products", label: "Menu", icon: LayoutGrid },
  { to: "/ladies", label: "Ladies", icon: Shirt },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/profile", label: "Account", icon: User },
];

const BottomBar = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { data: cart } = useCart();

  const cartCount = cart?.items?.length || 0;

  if (isLoggedIn) {
    const role = JSON.parse(localStorage.getItem("user") || "{}").role;
    if (role === "owner" || role === "admin") return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.to === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.to);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              <div className="relative p-1.5 rounded-xl">
                {isActive && (
                  <motion.span
                    layoutId="bottombar-active"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-primary/12"
                  />
                )}
                {tab.label === "Cart" && cartCount > 0 ? (
                  <span className="relative block">
                    <ShoppingBag className="h-5 w-5 relative z-10" />
                    <span className="absolute -top-1.5 -right-1.5 z-20 h-4 min-w-[16px] px-1 rounded-full bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-[9px] text-white font-bold flex items-center justify-center shadow-md">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  </span>
                ) : (
                  <tab.icon className="h-5 w-5 relative z-10" />
                )}
              </div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomBar;
