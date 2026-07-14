import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/store/authStore";
import { ToastProvider } from "@/store/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/layouts/ProtectedRoute";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import CategoryPage from "@/pages/CategoryPage";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Profile from "@/pages/Profile";
import Feedback from "@/pages/Feedback";

import Login from "@/pages/auth/Login";
import AdminLogin from "@/pages/auth/AdminLogin";
import OwnerLogin from "@/pages/auth/OwnerLogin";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyOTP from "@/pages/auth/VerifyOTP";

import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerProducts from "@/pages/owner/OwnerProducts";
import OwnerOrders from "@/pages/owner/OwnerOrders";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCategories from "@/pages/admin/AdminCategories";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
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

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/products" element={<Page><Products /></Page>} />
          <Route path="/products/:id" element={<Page><ProductDetail /></Page>} />
          <Route path="/category/:categoryName" element={<Page><CategoryPage /></Page>} />
          <Route path="/profile" element={<Page><Profile /></Page>} />
          <Route path="/cart" element={<Page><Cart /></Page>} />
          <Route path="/checkout" element={<Page><Checkout /></Page>} />
          <Route path="/feedback" element={<Page><Feedback /></Page>} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/admin/login" element={<Page><AdminLogin /></Page>} />
          <Route path="/owner/login" element={<Page><OwnerLogin /></Page>} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
          <Route path="/verify-otp" element={<Page><VerifyOTP /></Page>} />
        </Route>

        {/* Customer */}
        <Route element={<MainLayout />}>
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Page><Orders /></Page>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Owner */}
        <Route
          element={
            <ProtectedRoute roles={["owner"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/owner/dashboard" element={<Page><OwnerDashboard /></Page>} />
          <Route path="/owner/products" element={<Page><OwnerProducts /></Page>} />
          <Route path="/owner/orders" element={<Page><OwnerOrders /></Page>} />
        </Route>

        {/* Admin */}
        <Route
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<Page><AdminDashboard /></Page>} />
          <Route path="/admin/products" element={<Page><AdminProducts /></Page>} />
          <Route path="/admin/users" element={<Page><AdminUsers /></Page>} />
          <Route path="/admin/categories" element={<Page><AdminCategories /></Page>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
