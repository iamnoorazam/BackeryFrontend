import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/atoms/Logo";
import { useAuth } from "@/store/authStore";

const ownerLinks = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/products", label: "Products", icon: Package },
  { to: "/owner/orders", label: "Orders", icon: ShoppingBag },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: Tag },
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

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.role === "admin" ? adminLinks : ownerLinks;

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
        <div className="w-9" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-72 bg-white shadow-elevated animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <Logo showTagline={false} size="sm" />
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                <X className="h-5 w-5 text-stone-400" />
              </button>
            </div>
            <div className="p-3 flex flex-col h-[calc(100%-64px)]">
              <SidebarContent links={links} onNavigate={() => setSidebarOpen(false)} />
              <div className="mt-auto pt-4 border-t border-stone-100">
                <button
                  onClick={() => { setSidebarOpen(false); handleLogout(); }}
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
        <div className="p-5 border-b border-stone-100">
          <Logo showTagline={false} />
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Navigation</p>
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
