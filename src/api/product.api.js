import api from "./axios";

export const productApi = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  setAvailability: (id, isAvailable) => api.patch(`/products/${id}/availability`, { isAvailable }),
  bulkAvailability: (ids, isAvailable) =>
    api.patch("/products/bulk/availability", { ids, isAvailable }),
};
