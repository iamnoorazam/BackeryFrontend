import api from "./axios";

// Rider safety — SOS, incident reporting, admin triage (Phase 4, D9).
export const safetyApi = {
  sos: (body) => api.post("/safety/sos", body),
  incident: (body) => api.post("/safety/incident", body),
  mine: () => api.get("/safety/mine"),
  adminList: (status) => api.get("/safety/admin", { params: { status } }),
  adminResolve: (id, action, note) => api.put(`/safety/admin/${id}`, { action, note }),
};
