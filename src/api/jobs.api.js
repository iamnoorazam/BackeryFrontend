import api from "./axios";

// Super-admin background-jobs console (Phase 5, P5-10).
export const jobsApi = {
  health: () => api.get("/jobs/health"),
  runs: (params) => api.get("/jobs/runs", { params }),
  trigger: (name) => api.post("/jobs/trigger", { name }),
};
