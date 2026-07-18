import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  LogOut,
  Menu,
  X,
  Bell,
  Phone,
  ShoppingCart,
  AlertTriangle,
  History,
  Store,
  Boxes,
  BarChart3,
  UserCog,
  Wallet,
  MessageSquare,
  Bike,
  MapPin,
  ShieldAlert,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  FileText,
  LifeBuoy,
  Megaphone,
  Radar,
  Cpu,
  Search,
  FileBarChart,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/atoms/Logo";
import { useAuth } from "@/store/authStore";
import { useNotifications, useMarkAllRead } from "@/hooks/useNotifications";
import { formatDate, formatPrice } from "@/lib/utils";
import ImagePreview from "@/components/atoms/ImagePreview";

// Store owner — scoped to their own store only.
const ownerLinks = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/orders", label: "Orders", icon: ShoppingBag },
  { to: "/owner/products", label: "Products", icon: Package },
  { to: "/owner/inventory", label: "Inventory", icon: Boxes },
  { to: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/owner/coupons", label: "Coupons", icon: Tag },
  { to: "/owner/staff", label: "Staff", icon: UserCog },
  { to: "/owner/payouts", label: "Payouts", icon: Wallet },
  { to: "/owner/chat", label: "Messages", icon: MessageSquare },
  { to: "/merchant/settings", label: "Store Settings", icon: Store },
  { to: "/merchant/onboarding", label: "KYC / Status", icon: History },
];

// Platform admin — marketplace-wide operations.
const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/vendors", label: "Merchants", icon: Store },
  { to: "/admin/delivery-partners", label: "Delivery Partners", icon: Bike },
  { to: "/admin/delivery-ops", label: "Delivery Ops", icon: MapPin },
  { to: "/admin/safety", label: "Safety Alerts", icon: ShieldAlert },
  { to: "/admin/delivery-config", label: "Zones & Incentives", icon: Tag },
  { to: "/admin/finance", label: "Finance", icon: TrendingUp },
  { to: "/admin/fraud", label: "Fraud & Risk", icon: Radar },
  { to: "/admin/payouts", label: "Payouts", icon: Wallet },
  { to: "/admin/rider-payouts", label: "Rider Payouts", icon: Bike },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/cms", label: "Content (CMS)", icon: FileText },
  { to: "/admin/login-history", label: "Login History", icon: History },
  { to: "/admin/support", label: "Support", icon: LifeBuoy },
  { to: "/admin/notifications", label: "Notifications", icon: Megaphone },
  { to: "/admin/team", label: "Team & Roles", icon: ShieldCheck },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
  { to: "/admin/search-insights", label: "Search Insights", icon: Search },
  { to: "/admin/reports", label: "Reports & Export", icon: FileBarChart },
  { to: "/admin/jobs", label: "Background Jobs", icon: Cpu },
  { to: "/owner/issues", label: "Issues", icon: AlertTriangle },
];

const SidebarContent = ({ links, onNavigate }) => (
  <nav className="flex-1 px-2 space-y-0.5">
    {links.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive
              ? "bg-stone-900 text-white shadow-sm"
              : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
          }`
        }
      >
        <Icon className="h-4 w-4" />
        {label}
      </NavLink>
    ))}
  </nav>
);

const NotificationDropdown = ({ notifications, unreadCount, onMarkAllRead, userRole }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const recentNotifs = (notifications || []).slice(0, 10);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-stone-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-stone-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[420px] max-h-[540px] overflow-y-auto bg-white rounded-2xl shadow-elevated border border-stone-200 z-50">
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="text-sm font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>
          {recentNotifs.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-stone-400">No notifications yet</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentNotifs.map((n) => {
                const ordersPath = userRole === "admin" ? "/admin/orders" : "/owner/orders";
                const linkable = n.data?.orderId && (userRole === "owner" || userRole === "admin");
                const Wrapper = linkable ? Link : "div";
                return (
                  <Wrapper
                    key={n._id}
                    {...(linkable ? { to: ordersPath, onClick: () => setOpen(false) } : {})}
                    className={`flex gap-3 px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer ${!n.isRead ? "bg-indigo-50/50" : ""}`}
                  >
                    <div className="shrink-0">
                      {n.data?.productImages?.length > 0 ? (
                        <ImagePreview images={n.data.productImages}>
                          <div className="relative">
                            <img
                              src={n.data.productImages[0]}
                              alt=""
                              className="h-16 w-16 rounded-xl object-cover border border-stone-200"
                            />
                            {n.data.productImages.length > 1 && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-[10px] font-bold text-white">
                                +{n.data.productImages.length - 1}
                              </span>
                            )}
                          </div>
                        </ImagePreview>
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-stone-100 flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{n.message}</p>
                      {n.data?.customerName && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          Customer: {n.data.customerName}
                        </p>
                      )}
                      {n.data?.customerPhone && (
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {n.data.customerPhone}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        {n.data?.status && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              n.data.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : n.data.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {n.data.status}
                          </span>
                        )}
                        {n.data?.totalPrice && (
                          <p className="text-xs font-semibold text-indigo-600">
                            {formatPrice(n.data.totalPrice)}
                          </p>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllRead();

  const links = user?.role === "admin" ? adminLinks : ownerLinks;

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-stone-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-stone-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
        >
          <Menu className="h-5 w-5 text-stone-500" />
        </button>
        <Logo showTagline={false} size="sm" />
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={() => markAllRead.mutate()}
          userRole={user?.role}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-white shadow-elevated animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <Logo showTagline={false} size="sm" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="h-5 w-5 text-stone-400" />
              </button>
            </div>
            <div className="p-3 flex flex-col h-[calc(100%-64px)]">
              <SidebarContent links={links} onNavigate={() => setSidebarOpen(false)} />
              <div className="mt-auto pt-4 border-t border-stone-100">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-stone-200 h-screen sticky top-0">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <Logo showTagline={false} />
          {user?.role !== "customer" && (
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={() => markAllRead.mutate()}
              userRole={user?.role}
            />
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
            Navigation
          </p>
          <SidebarContent links={links} />
          <div className="mt-auto pt-4 border-t border-stone-100">
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-semibold text-stone-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
