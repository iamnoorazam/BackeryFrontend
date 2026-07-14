import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, LayoutGrid, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/store/authStore";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/products", label: "Menu", icon: LayoutGrid },
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
    if (role === "admin" || role === "owner") return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = tab.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.to);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[60px] h-full rounded-xl transition-colors ${
                isActive ? "text-orange-600" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-colors ${isActive ? "bg-orange-50" : ""}`}>
                {tab.label === "Cart" && cartCount > 0 ? (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-[9px] text-white font-bold flex items-center justify-center shadow-md">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  </>
                ) : (
                  <tab.icon className="h-5 w-5" />
                )}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-orange-600" : ""}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomBar;
