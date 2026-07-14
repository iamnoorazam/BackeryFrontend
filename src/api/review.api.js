import api from "./axios";

export const reviewApi = {
  getByProduct: (productId) => api.get(`/reviews/${productId}`),
  add: (productId, data) => api.post(`/reviews/${productId}`, data),
  edit: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};
