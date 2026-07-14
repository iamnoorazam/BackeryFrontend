import api from "./axios";

export const ownerApi = {
  getDashboard: () => api.get("/owner/dashboard"),
  getOrders: () => api.get("/owner/orders"),
  updateOrderStatus: (id, status) => api.put(`/owner/orders/${id}/status`, { status }),
  getProducts: () => api.get("/owner/products"),
};
