import api from "./axios";

export const cartApi = {
  get: () => api.get("/cart"),
  addItem: (data) => api.post("/cart/add", data),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  updateQuantity: (productId, quantity) => api.put(`/cart/quantity/${productId}`, { quantity }),
  clear: () => api.delete("/cart/clear"),
};
