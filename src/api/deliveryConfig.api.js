import api from "./axios";

// Delivery zones + rider incentives (Phase 4, D10).
export const deliveryConfigApi = {
  zones: (active) => api.get("/delivery-config/zones", { params: { active } }),
  createZone: (data) => api.post("/delivery-config/zones", data),
  updateZone: (id, data) => api.put(`/delivery-config/zones/${id}`, data),
  deleteZone: (id) => api.delete(`/delivery-config/zones/${id}`),
  incentives: () => api.get("/delivery-config/incentives"),
  activeIncentives: (city) => api.get("/delivery-config/incentives/active", { params: { city } }),
  createIncentive: (data) => api.post("/delivery-config/incentives", data),
  deleteIncentive: (id) => api.delete(`/delivery-config/incentives/${id}`),
};
