import { createContext, useContext, useState } from "react";
import { authApi } from "@/api/auth.api";
import { cartApi } from "@/api/cart.api";
import { merchantApi } from "@/api/merchant.api";
import { deliveryPartnerApi } from "@/api/deliveryPartner.api";

const GUEST_CART_KEY = "guest_cart";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const persistSession = ({ token, refreshToken, user }) => {
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { token, refreshToken, user } = res.data.data;
    persistSession({ token, refreshToken, user });
    setUser(user);

    if (user.role === "customer") {
      try {
        const rawGuestCart = localStorage.getItem(GUEST_CART_KEY);
        const guestCart = rawGuestCart ? JSON.parse(rawGuestCart) : { items: [] };

        if (Array.isArray(guestCart.items) && guestCart.items.length > 0) {
          for (const item of guestCart.items) {
            const productId = item.product?._id || item.product;
            if (productId && item?.quantity > 0) {
              await cartApi.addItem({
                productId,
                quantity: item.quantity,
                price: item.price,
                variant: item.variant || undefined,
              });
            }
          }
          localStorage.removeItem(GUEST_CART_KEY);
        }
      } catch {
        // Keep login flow resilient even if guest cart sync fails.
      }
    }

    return user;
  };

  const adminLogin = async (credentials) => {
    const res = await authApi.adminLogin(credentials);
    const { token, refreshToken, user } = res.data.data;
    persistSession({ token, refreshToken, user });
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { token, refreshToken, user } = res.data.data;
    persistSession({ token, refreshToken, user });
    setUser(user);
    return user;
  };

  // Merchant onboarding (Phase 3, M1): creates an owner + draft store and logs
  // them straight in so they can complete KYC. Returns the full payload
  // (incl. vendor) rather than just the user.
  const merchantRegister = async (data) => {
    const res = await merchantApi.register(data);
    const { token, refreshToken, user } = res.data.data;
    persistSession({ token, refreshToken, user });
    setUser(user);
    return res.data.data;
  };

  // Delivery-partner onboarding (Phase 4, D1): creates a rider (role "delivery")
  // + draft profile and logs them straight in to complete KYC. Returns the full
  // payload (incl. partner) rather than just the user.
  const deliveryRegister = async (data) => {
    const res = await deliveryPartnerApi.register(data);
    const { token, refreshToken, user } = res.data.data;
    persistSession({ token, refreshToken, user });
    setUser(user);
    return res.data.data;
  };

  const logout = () => {
    // Revoke this device's refresh token server-side (fire-and-forget).
    const refreshToken = localStorage.getItem("refreshToken");
    authApi.logout(refreshToken).catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        adminLogin,
        register,
        merchantRegister,
        deliveryRegister,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
