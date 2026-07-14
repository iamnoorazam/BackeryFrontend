import api from "./axios";

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markAllRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};
