import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/api/cart.api";
import { useAuth } from "@/store/authStore";

const GUEST_CART_KEY = "guest_cart";

const readGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : { items: [], totalPrice: 0 };
  } catch {
    return { items: [], totalPrice: 0 };
  }
};

const writeGuestCart = (cart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

const recalcTotal = (items) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

export const useCart = () => {
  const { user, isLoggedIn } = useAuth();
  return useQuery({
    queryKey: isLoggedIn && user?.role === "customer" ? ["cart"] : ["guest-cart"],
    queryFn: () =>
      isLoggedIn && user?.role === "customer"
        ? cartApi.get().then((r) => r.data.data)
        : Promise.resolve(readGuestCart()),
  });
};

// Live cart validation (logged-in customers only). Returns { valid, issues }.
export const useValidateCart = () => {
  const { user, isLoggedIn } = useAuth();
  const enabled = isLoggedIn && user?.role === "customer";
  return useQuery({
    queryKey: ["cart-validate"],
    queryFn: () => cartApi.validate().then((r) => r.data.data),
    enabled,
    staleTime: 0,
  });
};

export const useAddToCart = () => {
  const { user, isLoggedIn } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      if (isLoggedIn && user?.role === "customer") {
        return cartApi.addItem(data).then((r) => r.data.data);
      }

      const cart = readGuestCart();
      const existing = cart.items.find((item) => item.product?._id?.toString() === data.productId?.toString());
      if (existing) {
        existing.quantity += data.quantity || 1;
      } else {
        cart.items.push({
          product: { _id: data.productId },
          quantity: data.quantity || 1,
          price: data.price || 0,
          variant: data.variant || "",
        });
      }
      cart.totalPrice = recalcTotal(cart.items);
      writeGuestCart(cart);
      return Promise.resolve(cart);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["guest-cart"] });
      qc.invalidateQueries({ queryKey: ["cart-validate"] });
    },
  });
};

export const useRemoveFromCart = () => {
  const { user, isLoggedIn } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => {
      if (isLoggedIn && user?.role === "customer") {
        return cartApi.removeItem(productId).then((r) => r.data.data);
      }

      const cart = readGuestCart();
      cart.items = cart.items.filter((item) => item.product?._id?.toString() !== productId?.toString());
      cart.totalPrice = recalcTotal(cart.items);
      writeGuestCart(cart);
      return Promise.resolve(cart);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["guest-cart"] });
      qc.invalidateQueries({ queryKey: ["cart-validate"] });
    },
  });
};

export const useUpdateCartQuantity = () => {
  const { user, isLoggedIn } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }) => {
      if (isLoggedIn && user?.role === "customer") {
        return cartApi.updateQuantity(productId, quantity).then((r) => r.data.data);
      }

      const cart = readGuestCart();
      const item = cart.items.find((i) => i.product?._id?.toString() === productId?.toString());
      if (item) item.quantity = quantity;
      cart.totalPrice = recalcTotal(cart.items);
      writeGuestCart(cart);
      return Promise.resolve(cart);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["guest-cart"] });
      qc.invalidateQueries({ queryKey: ["cart-validate"] });
    },
  });
};

export const useClearCart = () => {
  const { user, isLoggedIn } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (isLoggedIn && user?.role === "customer") {
        return cartApi.clear();
      }
      writeGuestCart({ items: [], totalPrice: 0 });
      return Promise.resolve();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["guest-cart"] });
      qc.invalidateQueries({ queryKey: ["cart-validate"] });
    },
  });
};
