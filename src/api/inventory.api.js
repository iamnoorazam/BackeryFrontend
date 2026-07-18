import api from "./axios";

export const inventoryApi = {
  list: () => api.get("/inventory"),
  adjust: (productId, change, reason) =>
    api.post(`/inventory/${productId}/adjust`, { change, reason }),
  logs: (productId) => api.get(`/inventory/${productId}/logs`),
};
