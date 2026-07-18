import api from "./axios";

export const analyticsApi = {
  summary: (period) => api.get("/analytics/summary", { params: { period } }),
  sales: (period) => api.get("/analytics/sales", { params: { period } }),
  topProducts: (period, order) => api.get("/analytics/top-products", { params: { period, order } }),
  ordersCsv: (period) =>
    api.get("/analytics/orders.csv", { params: { period }, responseType: "blob" }),
};
