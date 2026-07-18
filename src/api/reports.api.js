import api from "./axios";

// Super-admin reporting & export (Phase 5, P5-12).
export const reportsApi = {
  list: () => api.get("/reports"),
  run: (type, params) => api.get(`/reports/${type}`, { params }),
  exportCsv: (type, params) => api.get(`/reports/${type}/export`, { params, responseType: "blob" }),
};
