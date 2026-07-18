import api from "./axios";

export const vendorApi = {
  getAll: (params) => api.get("/vendors", { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  getBySlug: (slug) => api.get(`/vendors/slug/${slug}`),
  getMyStore: () => api.get("/vendors/me/store"),
  create: (data) => api.post("/vendors", data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
};
