import api from "./axios";

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (role) => api.get("/admin/users", { params: { role } }),
  blockUnblock: (id, isBlocked) => api.put(`/admin/users/${id}/block`, { isBlocked }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  approveOwner: (id) => api.put(`/admin/users/${id}/approve`),
};
