import api from "./axios";

// Delivery-partner earnings + payouts (Phase 4, D6).
export const riderEarningsApi = {
  earnings: () => api.get("/rider-earnings/earnings"),
  request: (amount, method) => api.post("/rider-earnings", { amount, method }),
  mine: () => api.get("/rider-earnings/mine"),
  adminList: (status) => api.get("/rider-earnings/admin", { params: { status } }),
  process: (id, action, note) => api.put(`/rider-earnings/admin/${id}`, { action, note }),
};
