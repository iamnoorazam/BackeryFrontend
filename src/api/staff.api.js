import api from "./axios";

export const staffApi = {
  list: () => api.get("/staff"),
  create: (data) => api.post("/staff", data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  remove: (id) => api.delete(`/staff/${id}`),
};
