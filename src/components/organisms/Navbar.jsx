import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
  Home,
  Package,
  ShoppingBag,
  LogIn,
  UserPlus,
  MessageSquare,
  Search,
  ArrowRight,
  User,
  UtensilsCrossed,
  Store,
  Clock,
  Star,
  Shirt,
  Croissant,
  Heart,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/useCart";
import { useAuth } from "@/store/authStore";
import { useCart } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import { useUnifiedSearch } from "@/hooks/useSearch";
import Logo from "@/components/atoms/Logo";
import ThemeToggle from "@/components/atoms/ThemeToggle";
import NotificationBell from "@/components/organisms/NotificationBell";
import { formatPrice } from "@/lib/utils";
import { displayNames, isFashionCategory } from "@/lib/categories";

const splitCategories = (categories) => {
  const bakery = [];
  const boutique = [];
  (categories || []).forEach((cat) => {
    (isFashionCategory(cat.name) ? boutique : bakery).push(cat);
  });
  return { bakery, boutique };
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: cart } = useCart();
  const { data: categories } = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchResults } = useUnifiedSearch(debouncedQuery, {
    limit: 5,
    enabled: debouncedQuery.length >= 2,
  });

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
  }, []);

  const submitSearch = useCallback(
    (term) => {
      const q = String(term ?? searchQuery).trim();
      if (!q) return;
      navigate(`/search?q=${encodeURIComponent(q)}`);
      closeSearch();
    },
    [searchQuery, navigate, closeSearch],
  );

  useEffect(() => {
    const handle = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) closeSearch();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [closeSearch]);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);
  useEffect(() => {
    closeSearch();
  }, [location.pathname, closeSearch]);

  const cartCount = cart?.items?.length || 0;
  const dashboardPath =
    user?.role === "owner"
      ? "/owner/dashboard"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : null;

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-40 w-full nav-blur relative">
      <div className="w-full max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl hover:bg-muted transition-colors shrink-0"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
          <Logo />
          <nav className="hidden md:flex items-center ml-5">
            <div className="flex items-center gap-1">
              <NavPill to="/" label="Home" isActive={isActive("/") && !isActive("/products")} />
              <NavPill
                to="/stores"
                label="Stores"
                isActive={isActive("/stores") || isActive("/store")}
              />
              <NavPill to="/products" label="Shop" isActive={isActive("/products")} />
              <NavPill to="/ladies" label="Ladies" isActive={isActive("/ladies")} accent />
              <NavPill to="/feedback" label="Reviews" isActive={isActive("/feedback")} />
              <CategoryDropdown categories={categories} isActive={isActive} />
            </div>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Search */}
          <div ref={searchRef} className="hidden sm:block">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center relative"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search stores & dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitSearch();
                      }}
                      className="w-[200px] lg:w-[260px] h-10 pl-10 pr-9 text-sm rounded-2xl bg-muted border-border focus:bg-card"
                    />
                    <button
                      onClick={closeSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </button>
                  </div>
                  {debouncedQuery.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full right-0 mt-2 w-[200px] lg:w-[260px] bg-card border border-border rounded-2xl shadow-elevated overflow-hidden z-50"
                    >
                      {searchResults?.vendors?.length > 0 || searchResults?.products?.length > 0 ? (
                        <>
                          <div className="max-h-[380px] overflow-y-auto p-1.5">
                            {searchResults.vendors?.length > 0 && (
                              <>
                                <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                  Stores
                                </p>
                                {searchResults.vendors.map((v) => (
                                  <Link
                                    key={v._id}
                                    to={`/store/${v.slug}`}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                                  >
                                    <img
                                      src={
                                        v.logo || v.banner || "https://placehold.co/40x40?text=S"
                                      }
                                      alt={v.name}
                                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-muted"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-foreground truncate">
                                        {v.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground/70 truncate">
                                        {(v.cuisines || []).slice(0, 2).join(" · ") || "Store"}
                                      </p>
                                    </div>
                                    <Store className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                  </Link>
                                ))}
                              </>
                            )}
                            {searchResults.products?.length > 0 && (
                              <>
                                <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                  Dishes
                                </p>
                                {searchResults.products.map((p) => (
                                  <Link
                                    key={p._id}
                                    to={`/products/${p._id}`}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                                  >
                                    <img
                                      src={p.images?.[0] || "https://placehold.co/40x40"}
                                      alt={p.name}
                                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-muted"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-foreground truncate">
                                        {p.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground/70">
                                        {formatPrice(p.price)}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => submitSearch()}
                            className="flex w-full items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#D2691E] hover:bg-muted border-t border-border transition-colors"
                          >
                            View all results <ArrowRight className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <p className="px-4 py-8 text-sm text-muted-foreground/70 text-center">
                          No results found
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="h-10 w-10 rounded-xl hover:bg-muted transition-colors flex items-center justify-center"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile search */}
          <button
            onClick={() => navigate("/search")}
            className="sm:hidden h-10 w-10 rounded-xl hover:bg-muted transition-colors flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>

          <ThemeToggle className="hidden sm:inline-flex" />

          {/* User area */}
          {user ? (
            <>
              {user.role === "customer" && (
                <>
                  <NotificationBell />
                  <CartSheet cart={cart} cartCount={cartCount} navigate={navigate} />
                </>
              )}
              {(user.role === "owner" || user.role === "admin") && (
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="h-10 w-10 rounded-xl hover:bg-muted transition-colors flex items-center justify-center"
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
              <UserDropdown user={user} navigate={navigate} handleLogout={logout} />
            </>
          ) : (
            <>
              {/* Phones: single compact button to save space */}
              <Button variant="secondary" size="sm" className="sm:hidden h-9 px-3" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              {/* sm and up: full pair */}
              <div className="hidden sm:flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="text-muted-foreground h-9" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="secondary" size="sm" className="h-9" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* warm saffron→silk accent line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D2691E]/70 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-gradient-to-r from-[#D2691E] via-[#9E2B5E] to-[#E8A04F]" />

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isActive={isActive}
        categories={categories}
        user={user}
        navigate={navigate}
        handleLogout={logout}
        displayNames={displayNames}
      />
    </header>
  );
};

const NavPill = ({ to, label, isActive: active, accent }) => (
  <Link
    to={to}
    className={`group relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
      active
        ? accent
          ? "text-[#9E2B5E]"
          : "text-foreground"
        : accent
          ? "text-[#9E2B5E]/80 hover:text-[#9E2B5E]"
          : "text-muted-foreground hover:text-foreground"
    }`}
  >
    <span className="flex items-center gap-1">{label}</span>
    <span
      className={`absolute left-3.5 right-3.5 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#D2691E] to-[#9E2B5E] origin-left transition-transform duration-200 ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  </Link>
);

const CategoryDropdown = ({ categories }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { bakery, boutique } = splitCategories(categories);

  const renderGroup = (label, GroupIcon, items, accent) =>
    items.length > 0 && (
      <div>
        <p className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          <GroupIcon className={`h-3.5 w-3.5 ${accent}`} /> {label}
        </p>
        {items.map((cat) => (
          <Link
            key={cat._id}
            to={`/category/${cat.name?.toLowerCase()}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            {displayNames[cat.name] || cat.name}
          </Link>
        ))}
      </div>
    );

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`group relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
          location.pathname.startsWith("/category")
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Categories{" "}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        <span
          className={`absolute left-3.5 right-3.5 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#D2691E] to-[#9E2B5E] origin-left transition-transform duration-200 ${
            location.pathname.startsWith("/category")
              ? "scale-x-100"
              : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-60 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden"
          >
            <div className="p-1.5 max-h-[70vh] overflow-y-auto">
              <Link
                to="/products"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Package className="h-4 w-4" /> Shop Everything
              </Link>
              <Separator className="my-1" />
              {renderGroup("Bakery & Food", Croissant, bakery, "text-[#D2691E]")}
              {boutique.length > 0 && bakery.length > 0 && <Separator className="my-1" />}
              {renderGroup("Boutique & Fashion", Shirt, boutique, "text-[#9E2B5E]")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CartSheet = ({ cart, cartCount, navigate }) => {
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [touchY, setTouchY] = useState(0);

  const handleTouchStart = (e) => {
    if (e.touches[0].clientY < 80) {
      setTouchY(e.touches[0].clientY);
    }
  };
  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientY - touchY;
    if (diff > 0) setDragY(diff);
  };
  const handleTouchEnd = () => {
    if (dragY > 100) setOpen(false);
    setDragY(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="h-10 w-10 rounded-xl hover:bg-muted transition-colors flex items-center justify-center relative"
        aria-label="Cart"
      >
        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-[9px] text-white font-bold flex items-center justify-center shadow-md">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: dragY || 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-modal flex flex-col rounded-t-3xl max-h-[85vh] md:max-h-full md:rounded-none md:top-0 md:right-0 md:left-auto md:w-full md:max-w-sm md:border-l md:border-t-0 md:rounded-l-2xl"
            >
              <div className="flex md:hidden items-center justify-center pt-3 pb-1">
                <div className="w-12 h-1 rounded-full bg-muted" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-[#D2691E]" />
                  Cart ({cartCount})
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground/70" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {cart?.items?.length > 0 ? (
                  <div className="space-y-2">
                    {cart.items.map((item) => (
                      <CartDrawerItem key={item.product?._id || item._id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">Cart is empty</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Add items to get started</p>
                  </div>
                )}
              </div>
              {cart?.items?.length > 0 && (
                <div className="border-t border-border p-4 space-y-3 safe-area-bottom">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold text-foreground">{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <Button
                    variant="premium"
                    className="w-full h-12 text-sm"
                    onClick={() => {
                      setOpen(false);
                      navigate("/checkout");
                    }}
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const CartDrawerItem = ({ item }) => {
  const [qty, setQty] = useState(item.quantity);
  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();

  const handleQtyChange = (delta) => {
    const newQty = Math.max(1, qty + delta);
    setQty(newQty);
    updateQty.mutate({ productId: item.product?._id, quantity: newQty });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted border border-border">
      <img
        src={item.product?.images?.[0] || "https://placehold.co/48x48"}
        alt={item.product?.name}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 bg-muted"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate break-words">
          {item.product?.name}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {item.variant ? `${item.variant} · ` : ""}
          {formatPrice(item.price)}
        </p>
      </div>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => handleQtyChange(-1)}
          className="w-7 h-7 rounded-lg bg-card border border-border text-muted-foreground flex items-center justify-center text-sm font-bold hover:bg-muted transition-colors"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-bold text-foreground">{qty}</span>
        <button
          onClick={() => handleQtyChange(1)}
          className="w-7 h-7 rounded-lg bg-card border border-border text-muted-foreground flex items-center justify-center text-sm font-bold hover:bg-muted transition-colors"
        >
          +
        </button>
      </div>
      <button
        onClick={() => removeItem.mutate(item.product?._id)}
        className="p-1.5 text-muted-foreground/50 hover:text-danger transition-colors"
        aria-label="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const UserDropdown = ({ user, navigate, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-0.5 rounded-full hover:ring-2 hover:ring-[#D2691E]/30 transition-all"
        aria-label="User"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {user.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-56 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground/70 truncate">{user.email}</p>
              </div>
              {user.role === "customer" && (
                <>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/orders");
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" /> My Orders
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/wishlist");
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Heart className="h-4 w-4" /> My Wishlist
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/wallet");
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Wallet className="h-4 w-4" /> My Wallet
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <User className="h-4 w-4" /> Profile
              </button>
              <Separator className="my-1" />
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger-subtle transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileDrawer = ({
  open,
  onClose,
  isActive,
  categories,
  user,
  navigate,
  handleLogout,
  displayNames,
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 z-50 h-full w-72 bg-card shadow-elevated md:hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Logo showTagline={false} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground/70" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
            <MobileLink
              to="/"
              label="Home"
              icon={Home}
              isActive={isActive("/")}
              onClick={onClose}
            />
            <MobileLink
              to="/stores"
              label="Explore Stores"
              icon={Store}
              isActive={isActive("/stores") || isActive("/store")}
              onClick={onClose}
            />
            <MobileLink
              to="/products"
              label="Shop All"
              icon={Package}
              isActive={isActive("/products")}
              onClick={onClose}
            />
            <MobileLink
              to="/ladies"
              label="Ladies Boutique"
              icon={Shirt}
              isActive={isActive("/ladies")}
              onClick={onClose}
              boutique
            />
            <MobileLink
              to="/feedback"
              label="Reviews"
              icon={MessageSquare}
              isActive={isActive("/feedback")}
              onClick={onClose}
            />
            <Separator className="my-2" />
            <p className="flex items-center gap-1.5 px-3 text-[10px] text-[#D2691E] font-bold uppercase tracking-wider py-1.5">
              <Croissant className="h-3.5 w-3.5" /> Bakery & Food
            </p>
            {splitCategories(categories).bakery.map((cat) => (
              <MobileLink
                key={cat._id}
                to={`/category/${cat.name?.toLowerCase()}`}
                label={displayNames[cat.name] || cat.name}
                icon={Store}
                isActive={isActive(`/category/${cat.name?.toLowerCase()}`)}
                onClick={onClose}
              />
            ))}
            <p className="flex items-center gap-1.5 px-3 mt-2 text-[10px] text-[#9E2B5E] font-bold uppercase tracking-wider py-1.5">
              <Shirt className="h-3.5 w-3.5" /> Boutique & Fashion
            </p>
            {splitCategories(categories).boutique.map((cat) => (
              <MobileLink
                key={cat._id}
                to={`/category/${cat.name?.toLowerCase()}`}
                label={displayNames[cat.name] || cat.name}
                icon={Shirt}
                isActive={isActive(`/category/${cat.name?.toLowerCase()}`)}
                onClick={onClose}
              />
            ))}
            {user && (
              <>
                <Separator className="my-2" />
                {user.role === "customer" && (
                  <>
                    <MobileLink
                      to="/orders"
                      label="My Orders"
                      icon={ShoppingBag}
                      isActive={isActive("/orders")}
                      onClick={onClose}
                    />
                    <MobileLink
                      to="/wishlist"
                      label="My Wishlist"
                      icon={Heart}
                      isActive={isActive("/wishlist")}
                      onClick={onClose}
                    />
                    <MobileLink
                      to="/wallet"
                      label="My Wallet"
                      icon={Wallet}
                      isActive={isActive("/wallet")}
                      onClick={onClose}
                    />
                  </>
                )}
                <MobileLink
                  to="/profile"
                  label="Profile"
                  icon={User}
                  isActive={isActive("/profile")}
                  onClick={onClose}
                />
                <button
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger-subtle transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            )}
            {!user && (
              <>
                <Separator className="my-2" />
                <MobileLink to="/login" label="Log In" icon={LogIn} onClick={onClose} />
                <MobileLink
                  to="/register"
                  label="Sign Up"
                  icon={UserPlus}
                  onClick={onClose}
                  highlight
                />
              </>
            )}
            <Separator className="my-2" />
            <ThemeToggle variant="pill" />
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const MobileLink = ({ to, label, icon: Icon, isActive: active, onClick, highlight, boutique }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active
        ? boutique
          ? "bg-gradient-to-r from-[#9E2B5E] to-[#D2691E] text-white shadow-sm"
          : "bg-primary text-primary-foreground shadow-sm"
        : highlight
          ? "bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white shadow-sm"
          : boutique
            ? "text-brand-2 hover:bg-brand-2/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`}
  >
    <Icon
      className={`h-4 w-4 ${
        active
          ? boutique
            ? "text-white"
            : "text-primary-foreground"
          : highlight
            ? "text-white"
            : boutique
              ? "text-brand-2"
              : "text-muted-foreground/70"
      }`}
    />
    {label}
  </Link>
);

export default Navbar;
