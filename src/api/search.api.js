import api from "./axios";

export const searchApi = {
  unified: (params) => api.get("/search", { params }),
  suggest: (q) => api.get("/search/suggest", { params: { q } }),
  trending: () => api.get("/search/trending"),
  // Admin merchandising analytics (Phase 5, P5-11).
  analytics: (days) => api.get("/search/admin/analytics", { params: { days } }),
};
