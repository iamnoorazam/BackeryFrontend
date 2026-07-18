import api from "./axios";

// Super-admin Fraud & Risk control plane (Phase 5, P5-9).
export const fraudApi = {
  overview: () => api.get("/fraud/overview"),
  riskyCustomers: (params) => api.get("/fraud/risky-customers", { params }),
  scoreCustomer: (id) => api.get(`/fraud/customers/${id}/score`),
  listFlags: (params) => api.get("/fraud/flags", { params }),
  getFlag: (id) => api.get(`/fraud/flags/${id}`),
  runRules: () => api.post("/fraud/rules/run"),
  createFlag: (d) => api.post("/fraud/flags", d),
  actOnFlag: (id, d) => api.put(`/fraud/flags/${id}/act`, d),
};
