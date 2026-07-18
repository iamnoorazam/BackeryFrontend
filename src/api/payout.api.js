import api from "./axios";

export const payoutApi = {
  earnings: () => api.get("/payouts/earnings"),
  request: (amount) => api.post("/payouts", { amount }),
  mine: () => api.get("/payouts/mine"),
  adminList: (status) => api.get("/payouts/admin", { params: { status } }),
  process: (id, action, note) => api.put(`/payouts/admin/${id}`, { action, note }),
};
