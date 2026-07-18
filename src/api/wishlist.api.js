import api from "./axios";

export const wishlistApi = {
  get: () => api.get("/wishlist"),
  toggle: (productId) => api.post(`/wishlist/${productId}/toggle`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};
