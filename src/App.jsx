import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/store/authStore";
import { ToastProvider } from "@/store/Toast";
import { ThemeProvider } from "@/store/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

import ProductQuickView from "@/components/organisms/ProductQuickView";
import BuyNowCheckout from "@/pages/BuyNowCheckout";
import BuyNowPayment from "@/pages/BuyNowPayment";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/layouts/ProtectedRoute";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import CategoryPage from "@/pages/CategoryPage";
import Stores from "@/pages/Stores";
import StoreDetail from "@/pages/StoreDetail";
import Search from "@/pages/Search";
import Ladies from "@/pages/Ladies";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Wishlist from "@/pages/Wishlist";
import Wallet from "@/pages/Wallet";
import Profile from "@/pages/Profile";
import Feedback from "@/pages/Feedback";

import Login from "@/pages/auth/Login";
import AdminLogin from "@/pages/auth/AdminLogin";
import OwnerLogin from "@/pages/auth/OwnerLogin";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyOTP from "@/pages/auth/VerifyOTP";

import MerchantRegister from "@/pages/merchant/MerchantRegister";
import MerchantOnboarding from "@/pages/merchant/MerchantOnboarding";
import DeliveryRegister from "@/pages/delivery/DeliveryRegister";
import DeliveryOnboarding from "@/pages/delivery/DeliveryOnboarding";
import DeliveryDashboard from "@/pages/delivery/DeliveryDashboard";
import DeliveryEarnings from "@/pages/delivery/DeliveryEarnings";
import DeliveryPerformance from "@/pages/delivery/DeliveryPerformance";
import DeliverySettings from "@/pages/delivery/DeliverySettings";
import MerchantSettings from "@/pages/merchant/MerchantSettings";

import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerProducts from "@/pages/owner/OwnerProducts";
import OwnerInventory from "@/pages/owner/OwnerInventory";
import OwnerAnalytics from "@/pages/owner/OwnerAnalytics";
import OwnerCoupons from "@/pages/owner/OwnerCoupons";
import OwnerStaff from "@/pages/owner/OwnerStaff";
import OwnerPayouts from "@/pages/owner/OwnerPayouts";
import OwnerChat from "@/pages/owner/OwnerChat";
import OwnerOrders from "@/pages/owner/OwnerOrders";
import OwnerIssues from "@/pages/owner/OwnerIssues";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminVendors from "@/pages/admin/AdminVendors";
import AdminDeliveryPartners from "@/pages/admin/AdminDeliveryPartners";
import AdminRiderPayouts from "@/pages/admin/AdminRiderPayouts";
import AdminDeliveryOps from "@/pages/admin/AdminDeliveryOps";
import AdminSafety from "@/pages/admin/AdminSafety";
import AdminDeliveryConfig from "@/pages/admin/AdminDeliveryConfig";
import AdminPayouts from "@/pages/admin/AdminPayouts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminLoginHistory from "@/pages/admin/AdminLoginHistory";
import AdminTeam from "@/pages/admin/AdminTeam";
import AdminAuditLogs from "@/pages/admin/AdminAuditLogs";
import AdminFinance from "@/pages/admin/AdminFinance";
import AdminCMS from "@/pages/admin/AdminCMS";
import AdminSupport from "@/pages/admin/AdminSupport";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminFraud from "@/pages/admin/AdminFraud";
import AdminJobs from "@/pages/admin/AdminJobs";
import AdminSearchInsights from "@/pages/admin/AdminSearchInsights";
import AdminReports from "@/pages/admin/AdminReports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Treat data as fresh for 30s so navigating between pages doesn't refetch
      // everything on every mount/focus. Explicit invalidations (after cart/order
      // mutations) still refetch immediately regardless of staleTime, and hooks
      // that need live data set their own refetchInterval (notifications, orders).
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: "easeIn" } },
};

const Page = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

// Reset scroll to top on real page navigations. Keyed on the *routed* pathname
// (the background page), so opening a quick-view modal over the current page
// does NOT scroll the page behind it.
const ScrollToTop = ({ pathname }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  const location = useLocation();
  // Background-location routing: when a modal route (e.g. a product quick view)
  // is opened from within a page, it carries the originating page as
  // `state.backgroundLocation`. The main router keeps rendering that background
  // page while the modal overlays on top. On a hard refresh/deep link the state
  // is gone, so the same URL resolves to its real full-page route instead.
  const backgroundLocation = location.state?.backgroundLocation;
  const routedLocation = backgroundLocation || location;
  return (
    <>
    <ScrollToTop pathname={routedLocation.pathname} />
    <AnimatePresence mode="wait">
      <Routes location={routedLocation} key={routedLocation.pathname}>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <Page>
                <Home />
              </Page>
            }
          />
          <Route
            path="/products"
            element={
              <Page>
                <Products />
              </Page>
            }
          />
          <Route
            path="/products/:id"
            element={
              <Page>
                <ProductDetail />
              </Page>
            }
          />
          <Route
            path="/category/:categoryName"
            element={
              <Page>
                <CategoryPage />
              </Page>
            }
          />
          <Route
            path="/stores"
            element={
              <Page>
                <Stores />
              </Page>
            }
          />
          <Route
            path="/store/:slug"
            element={
              <Page>
                <StoreDetail />
              </Page>
            }
          />
          <Route
            path="/search"
            element={
              <Page>
                <Search />
              </Page>
            }
          />
          <Route
            path="/ladies"
            element={
              <Page>
                <Ladies />
              </Page>
            }
          />
          <Route
            path="/profile"
            element={
              <Page>
                <Profile />
              </Page>
            }
          />
          <Route
            path="/cart"
            element={
              <Page>
                <Cart />
              </Page>
            }
          />
          <Route
            path="/checkout"
            element={
              <Page>
                <Checkout />
              </Page>
            }
          />
          <Route
            path="/buy-now"
            element={
              <Page>
                <BuyNowCheckout />
              </Page>
            }
          />
          <Route
            path="/buy-now/payment"
            element={
              <Page>
                <BuyNowPayment />
              </Page>
            }
          />
          <Route
            path="/feedback"
            element={
              <Page>
                <Feedback />
              </Page>
            }
          />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <Page>
                <Login />
              </Page>
            }
          />
          <Route
            path="/admin/login"
            element={
              <Page>
                <AdminLogin />
              </Page>
            }
          />
          <Route
            path="/owner/login"
            element={
              <Page>
                <OwnerLogin />
              </Page>
            }
          />
          <Route
            path="/register"
            element={
              <Page>
                <Register />
              </Page>
            }
          />
          <Route
            path="/merchant/register"
            element={
              <Page>
                <MerchantRegister />
              </Page>
            }
          />
          <Route
            path="/delivery/register"
            element={
              <Page>
                <DeliveryRegister />
              </Page>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Page>
                <ForgotPassword />
              </Page>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <Page>
                <VerifyOTP />
              </Page>
            }
          />
        </Route>

        {/* Merchant onboarding — full-screen, no dashboard chrome (owner/admin). */}
        <Route
          path="/merchant/onboarding"
          element={
            <ProtectedRoute roles={["owner", "admin"]}>
              <Page>
                <MerchantOnboarding />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Delivery-partner onboarding + dashboard — full-screen (delivery/admin). */}
        <Route
          path="/delivery/onboarding"
          element={
            <ProtectedRoute roles={["delivery", "admin"]}>
              <Page>
                <DeliveryOnboarding />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute roles={["delivery", "admin"]}>
              <Page>
                <DeliveryDashboard />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/earnings"
          element={
            <ProtectedRoute roles={["delivery", "admin"]}>
              <Page>
                <DeliveryEarnings />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/performance"
          element={
            <ProtectedRoute roles={["delivery", "admin"]}>
              <Page>
                <DeliveryPerformance />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/settings"
          element={
            <ProtectedRoute roles={["delivery", "admin"]}>
              <Page>
                <DeliverySettings />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/chat"
          element={
            <ProtectedRoute roles={["delivery", "admin"]}>
              <Page>
                <div className="min-h-screen bg-stone-50 py-6 px-4">
                  <div className="max-w-4xl mx-auto">
                    <OwnerChat />
                  </div>
                </div>
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Customer */}
        <Route element={<MainLayout />}>
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Page>
                  <Orders />
                </Page>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Page>
                  <Wishlist />
                </Page>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Page>
                  <Wallet />
                </Page>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Store owner — scoped to their own store. Admin inherits store access.
            Staff (M8) act on their owner's store per their delegated permissions. */}
        <Route
          element={
            <ProtectedRoute roles={["owner", "admin", "staff"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/owner/dashboard"
            element={
              <Page>
                <OwnerDashboard />
              </Page>
            }
          />
          <Route
            path="/owner/products"
            element={
              <Page>
                <OwnerProducts />
              </Page>
            }
          />
          <Route
            path="/owner/orders"
            element={
              <Page>
                <OwnerOrders />
              </Page>
            }
          />
          <Route
            path="/owner/inventory"
            element={
              <Page>
                <OwnerInventory />
              </Page>
            }
          />
          <Route
            path="/owner/analytics"
            element={
              <Page>
                <OwnerAnalytics />
              </Page>
            }
          />
          <Route
            path="/owner/coupons"
            element={
              <Page>
                <OwnerCoupons />
              </Page>
            }
          />
          <Route
            path="/owner/staff"
            element={
              <Page>
                <OwnerStaff />
              </Page>
            }
          />
          <Route
            path="/owner/payouts"
            element={
              <Page>
                <OwnerPayouts />
              </Page>
            }
          />
          <Route
            path="/owner/chat"
            element={
              <Page>
                <OwnerChat />
              </Page>
            }
          />
          <Route
            path="/merchant/settings"
            element={
              <Page>
                <MerchantSettings />
              </Page>
            }
          />
        </Route>

        {/* Platform admin only — marketplace-wide operations. */}
        <Route
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin/dashboard"
            element={
              <Page>
                <AdminDashboard />
              </Page>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <Page>
                <AdminOrders />
              </Page>
            }
          />
          <Route
            path="/admin/products"
            element={
              <Page>
                <AdminProducts />
              </Page>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Page>
                <AdminUsers />
              </Page>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <Page>
                <AdminVendors />
              </Page>
            }
          />
          <Route
            path="/admin/delivery-partners"
            element={
              <Page>
                <AdminDeliveryPartners />
              </Page>
            }
          />
          <Route
            path="/admin/rider-payouts"
            element={
              <Page>
                <AdminRiderPayouts />
              </Page>
            }
          />
          <Route
            path="/admin/delivery-ops"
            element={
              <Page>
                <AdminDeliveryOps />
              </Page>
            }
          />
          <Route
            path="/admin/safety"
            element={
              <Page>
                <AdminSafety />
              </Page>
            }
          />
          <Route
            path="/admin/delivery-config"
            element={
              <Page>
                <AdminDeliveryConfig />
              </Page>
            }
          />
          <Route
            path="/admin/payouts"
            element={
              <Page>
                <AdminPayouts />
              </Page>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <Page>
                <AdminCategories />
              </Page>
            }
          />
          <Route
            path="/admin/login-history"
            element={
              <Page>
                <AdminLoginHistory />
              </Page>
            }
          />
          <Route
            path="/admin/team"
            element={
              <Page>
                <AdminTeam />
              </Page>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <Page>
                <AdminAuditLogs />
              </Page>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <Page>
                <AdminFinance />
              </Page>
            }
          />
          <Route
            path="/admin/cms"
            element={
              <Page>
                <AdminCMS />
              </Page>
            }
          />
          <Route
            path="/admin/support"
            element={
              <Page>
                <AdminSupport />
              </Page>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <Page>
                <AdminNotifications />
              </Page>
            }
          />
          <Route
            path="/admin/fraud"
            element={
              <Page>
                <AdminFraud />
              </Page>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <Page>
                <AdminJobs />
              </Page>
            }
          />
          <Route
            path="/admin/search-insights"
            element={
              <Page>
                <AdminSearchInsights />
              </Page>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Page>
                <AdminReports />
              </Page>
            }
          />
          <Route
            path="/owner/issues"
            element={
              <Page>
                <OwnerIssues />
              </Page>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>

    {/* Modal routes — only rendered when opened over a background page */}
    {backgroundLocation && (
      <Routes>
        <Route path="/products/:id" element={<ProductQuickView />} />
      </Routes>
    )}
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
