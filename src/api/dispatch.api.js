import api from "./axios";

// Order assignment / dispatch (Phase 4, D3).
export const dispatchApi = {
  requestRider: (orderId) => api.post(`/dispatch/orders/${orderId}/request-rider`),
  myOffers: () => api.get("/dispatch/offers"),
  myAssignments: () => api.get("/dispatch/assignments"),
  accept: (orderId) => api.post(`/dispatch/orders/${orderId}/accept`),
  reject: (orderId) => api.post(`/dispatch/orders/${orderId}/reject`),
  // Customer live tracking (D5).
  track: (orderId) => api.get(`/dispatch/track/${orderId}`),
  // Live trip lifecycle (D4). `step` is one of arrived-pickup | pickup |
  // arrived-drop | verify-otp | fail.
  trip: (orderId, step, body) => api.post(`/dispatch/orders/${orderId}/${step}`, body),
  // Admin delivery operations (D8).
  adminRiders: (status) => api.get("/dispatch/admin/riders", { params: { status } }),
  adminActiveOrders: () => api.get("/dispatch/admin/active-orders"),
  adminAssign: (orderId, partnerId) =>
    api.post(`/dispatch/admin/orders/${orderId}/assign`, { partnerId }),
};
