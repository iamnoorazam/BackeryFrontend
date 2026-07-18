import api from "./axios";

export const financeApi = {
  overview: () => api.get("/finance/overview"),
  ledger: (limit = 50) => api.get("/finance/ledger", { params: { limit } }),
  refunds: (status) => api.get("/finance/refunds", { params: { status } }),
  createRefund: (payload) => api.post("/finance/refunds", payload),
  actOnRefund: (id, action, note) => api.put(`/finance/refunds/${id}`, { action, note }),
  failedPayments: () => api.get("/finance/failed-payments"),
  retryPayment: (id) => api.post(`/finance/orders/${id}/retry-payment`),
  invoice: (id) => api.get(`/finance/orders/${id}/invoice`),
};
