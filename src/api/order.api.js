import api from "./axios";

export const orderApi = {
  place: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders/my"),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateAddress: (id, deliveryAddress) => api.put(`/orders/${id}/address`, { deliveryAddress }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getAll: () => api.get("/orders/all"),
  generateOtp: (id) => api.put(`/orders/${id}/generate-otp`),
  verifyOtp: (id, otp) => api.put(`/orders/${id}/verify-otp`, { otp }),
  getDeliveryOtp: (id) => api.get(`/orders/${id}/delivery-otp`),
};
