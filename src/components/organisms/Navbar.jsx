import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, LogOut, LayoutDashboard, ChevronDown, Menu, X,
  Home, Package, ShoppingBag, LogIn, UserPlus,
  MessageSquare, Search, ArrowRight, User, UtensilsCrossed,
  Store, Clock, Star
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
import { productApi } from "@/api/product.api";
import Logo from "@/components/atoms/Logo";
import { formatPrice } from "@/lib/utils";

const displayNames = {
  Cake: "Cakes", Burger: "Burgers", Pizza: "Pizza", Momos: "Momos",
  Biryani: "Biryani", Coldrink: "Cold Drinks", "Egg Rolls": "Egg Rolls", Fruit: "Fruits",
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

  const { data: searchResults } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => productApi.getAll({ search: debouncedQuery, limit: 6 }).then((r) => r.data.data),
    enabled: debouncedQuery.length >= 2,
  });

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
  }, []);

  useEffect(() => {
    const handle = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) closeSearch(); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [closeSearch]);

  useEffect(() => { if (searchOpen && inputRef.current) inputRef.current.focus(); }, [searchOpen]);
  useEffect(() => { closeSearch(); }, [location.pathname, closeSearch]);

  const cartCount = cart?.items?.length || 0;
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : user?.role === "owner" ? "/owner/dashboard" : null;

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-40 w-full nav-blur">
      <div className="w-full max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-stone-100 transition-colors" aria-label="Menu">
            <Menu className="h-5 w-5 text-stone-500" />
          </button>
          <Logo />
          <nav className="hidden md:flex items-center ml-6">
            <div className="flex items-center gap-0.5 bg-stone-100/60 p-0.5 rounded-2xl">
              <NavPill to="/" label="Home" isActive={isActive("/") && !isActive("/products")} />
              <NavPill to="/products" label="Menu" isActive={isActive("/products")} />
              <NavPill to="/feedback" label="Reviews" isActive={isActive("/feedback")} />
              <CategoryDropdown categories={categories} isActive={isActive} displayNames={displayNames} />
            </div>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[200px] lg:w-[260px] h-10 pl-10 pr-9 text-sm rounded-2xl bg-stone-50 border-stone-200 focus:bg-white"
                    />
                    <button onClick={closeSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-stone-100 transition-colors">
                      <X className="h-3.5 w-3.5 text-stone-400" />
                    </button>
                  </div>
                  {debouncedQuery.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full right-0 mt-2 w-[200px] lg:w-[260px] bg-white border border-stone-200 rounded-2xl shadow-elevated overflow-hidden z-50"
                    >
                      {searchResults?.products?.length > 0 ? (
                        <>
                          <div className="max-h-[360px] overflow-y-auto p-1.5">
                            {searchResults.products.map((p) => (
                              <Link
                                key={p._id}
                                to={`/products/${p._id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                              >
                                <img
                                  src={p.images?.[0] || "https://placehold.co/40x40"}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover shrink-0 bg-stone-100"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-stone-900 truncate">{p.name}</p>
                                  <p className="text-xs text-stone-400">{formatPrice(p.price)}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <Link
                            to={`/products?search=${encodeURIComponent(debouncedQuery)}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-orange-600 hover:bg-stone-50 border-t border-stone-100 transition-colors"
                          >
                            View all results <ArrowRight className="h-3 w-3" />
                          </Link>
                        </>
                      ) : (
                        <p className="px-4 py-8 text-sm text-stone-400 text-center">No results found</p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="h-10 w-10 rounded-xl hover:bg-stone-100 transition-colors flex items-center justify-center"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-stone-500" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden h-10 w-10 rounded-xl hover:bg-stone-100 transition-colors flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-stone-500" />
          </button>

          {/* User area */}
          {user ? (
            <>
              {user.role === "customer" && (
                <CartSheet cart={cart} cartCount={cartCount} navigate={navigate} />
              )}
              {(user.role === "admin" || user.role === "owner") && (
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="h-10 w-10 rounded-xl hover:bg-stone-100 transition-colors flex items-center justify-center"
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="h-5 w-5 text-stone-500" />
                </button>
              )}
              <UserDropdown user={user} navigate={navigate} handleLogout={logout} />
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="text-stone-600 h-9" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="secondary" size="sm" className="h-9" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

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

const NavPill = ({ to, label, isActive: active }) => (
  <Link
    to={to}
    className={`px-4 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 ${
      active
        ? "bg-white text-stone-900 shadow-sm"
        : "text-stone-500 hover:text-stone-700"
    }`}
  >
    {label}
  </Link>
);

const CategoryDropdown = ({ categories, isActive, displayNames }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={`px-4 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-1 ${
          location.pathname.startsWith("/category") ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Categories <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-52 bg-white border border-stone-200 rounded-2xl shadow-elevated z-50 overflow-hidden"
          >
            <div className="p-1.5">
              <Link
                to="/products"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              >
                <Package className="h-4 w-4" /> All Items
              </Link>
              <Separator className="my-1" />
              {categories?.map((cat) => {
                const IconComponent = cat.image ? null : Store;
                return (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.name?.toLowerCase()}`}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                  >
                    <Store className="h-4 w-4 text-stone-400" />
                    {displayNames[cat.name] || cat.name}
                  </Link>
                );
              })}
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
        className="h-10 w-10 rounded-xl hover:bg-stone-100 transition-colors flex items-center justify-center relative"
        aria-label="Cart"
      >
        <ShoppingCart className="h-5 w-5 text-stone-600" />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-[9px] text-white font-bold flex items-center justify-center shadow-md">
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
              className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-modal flex flex-col rounded-t-3xl max-h-[85vh] md:max-h-full md:rounded-none md:top-0 md:right-0 md:left-auto md:w-full md:max-w-sm md:border-l md:border-t-0 md:rounded-l-2xl"
            >
              <div className="flex md:hidden items-center justify-center pt-3 pb-1">
                <div className="w-12 h-1 rounded-full bg-stone-200" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                  Cart ({cartCount})
                </h2>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                  <X className="h-5 w-5 text-stone-400" />
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
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                      <ShoppingCart className="h-6 w-6 text-stone-300" />
                    </div>
                    <p className="text-sm font-semibold text-stone-600">Cart is empty</p>
                    <p className="text-xs text-stone-400 mt-1">Add items to get started</p>
                  </div>
                )}
              </div>
              {cart?.items?.length > 0 && (
                <div className="border-t border-stone-100 p-4 space-y-3 safe-area-bottom">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="font-bold text-stone-900">{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <Button
                    variant="premium"
                    className="w-full h-12 text-sm"
                    onClick={() => { setOpen(false); navigate("/checkout"); }}
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
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
      <img
        src={item.product?.images?.[0] || "https://placehold.co/48x48"}
        alt={item.product?.name}
        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-900 truncate">{item.product?.name}</p>
        <p className="text-xs text-stone-400">{item.variant ? `${item.variant} · ` : ""}{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center gap-0.5">
        <button onClick={() => handleQtyChange(-1)} className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold hover:bg-stone-50 transition-colors">
          −
        </button>
        <span className="w-7 text-center text-sm font-bold text-stone-900">{qty}</span>
        <button onClick={() => handleQtyChange(1)} className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold hover:bg-stone-50 transition-colors">
          +
        </button>
      </div>
      <button onClick={() => removeItem.mutate(item.product?._id)} className="p-1.5 text-stone-300 hover:text-red-500 transition-colors" aria-label="Remove">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const UserDropdown = ({ user, navigate, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-0.5 rounded-full hover:ring-2 hover:ring-orange-500/30 transition-all"
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
            className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-stone-200 rounded-2xl shadow-elevated z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
              </div>
              {user.role === "customer" && (
                <button onClick={() => { setOpen(false); navigate("/orders"); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                  <ShoppingBag className="h-4 w-4" /> My Orders
                </button>
              )}
              <button onClick={() => { setOpen(false); navigate("/profile"); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                <User className="h-4 w-4" /> Profile
              </button>
              <Separator className="my-1" />
              <button onClick={() => { setOpen(false); handleLogout(); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileDrawer = ({ open, onClose, isActive, categories, user, navigate, handleLogout, displayNames }) => (
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
          className="fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-elevated md:hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-stone-100">
            <Logo showTagline={false} size="sm" />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <X className="h-5 w-5 text-stone-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
            <MobileLink to="/" label="Home" icon={Home} isActive={isActive("/")} onClick={onClose} />
            <MobileLink to="/products" label="Menu" icon={Package} isActive={isActive("/products")} onClick={onClose} />
            <MobileLink to="/feedback" label="Reviews" icon={MessageSquare} isActive={isActive("/feedback")} onClick={onClose} />
            <Separator className="my-2" />
            <p className="px-3 text-[10px] text-stone-400 font-semibold uppercase tracking-wider py-1.5">Categories</p>
            {categories?.map((cat) => (
              <MobileLink
                key={cat._id}
                to={`/category/${cat.name?.toLowerCase()}`}
                label={displayNames[cat.name] || cat.name}
                icon={Store}
                isActive={isActive(`/category/${cat.name?.toLowerCase()}`)}
                onClick={onClose}
              />
            ))}
            {user && (
              <>
                <Separator className="my-2" />
                {user.role === "customer" && (
                  <MobileLink to="/orders" label="My Orders" icon={ShoppingBag} isActive={isActive("/orders")} onClick={onClose} />
                )}
                <MobileLink to="/profile" label="Profile" icon={User} isActive={isActive("/profile")} onClick={onClose} />
                <button onClick={() => { onClose(); handleLogout(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            )}
            {!user && (
              <>
                <Separator className="my-2" />
                <MobileLink to="/login" label="Log In" icon={LogIn} onClick={onClose} />
                <MobileLink to="/register" label="Sign Up" icon={UserPlus} onClick={onClose} highlight />
              </>
            )}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const MobileLink = ({ to, label, icon: Icon, isActive: active, onClick, highlight }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-stone-900 text-white shadow-sm"
        : highlight
        ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm"
        : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
    }`}
  >
    <Icon className={`h-4 w-4 ${active || highlight ? "text-white" : "text-stone-400"}`} />
    {label}
  </Link>
);

export default Navbar;
