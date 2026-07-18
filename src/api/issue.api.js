import api from "./axios";

export const issueApi = {
  getAll: (status) => api.get("/issues", { params: { status } }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post("/issues", data),
  updateStatus: (id, status) => api.put(`/issues/${id}/status`, { status }),
  delete: (id) => api.delete(`/issues/${id}`),
  getStats: () => api.get("/issues/stats"),
};
