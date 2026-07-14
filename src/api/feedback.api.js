import api from "./axios";

export const feedbackApi = {
  getAll: () => api.get("/feedback"),
  create: (data) => api.post("/feedback", data),
  delete: (id) => api.delete(`/feedback/${id}`),
};
