import { createContext, useContext, useState } from "react";
import { authApi } from "@/api/auth.api";
import { cartApi } from "@/api/cart.api";

const GUEST_CART_KEY = "guest_cart";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { token, user } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
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
    const { token, user } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { token, user } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
