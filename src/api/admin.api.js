import api from "./axios";

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getCommandCenter: () => api.get("/admin/overview"),
  getUsers: (role) => api.get("/admin/users", { params: role ? { role } : {} }),
  getLoginHistory: () => api.get("/admin/login-history"),
  blockUnblock: (id, isBlocked) => api.put(`/admin/users/${id}/block`, { isBlocked }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // User Management 360 (Phase 5, P5-3)
  getUserProfile: (id) => api.get(`/admin/users/${id}/profile`),
  exportUser: (id) => api.get(`/admin/users/${id}/export`, { responseType: "blob" }),
  gdprEraseUser: (id) => api.delete(`/admin/users/${id}/gdpr`),
  // Merchant onboarding review (Phase 3, M1)
  getVendors: (status) => api.get("/admin/vendors", { params: status ? { status } : {} }),
  approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
  rejectVendor: (id, reason) => api.put(`/admin/vendors/${id}/reject`, { reason }),
  // Delivery-partner onboarding review (Phase 4, D1)
  getDeliveryPartners: (status) => api.get("/admin/delivery-partners", { params: status ? { status } : {} }),
  approveDeliveryPartner: (id) => api.put(`/admin/delivery-partners/${id}/approve`),
  rejectDeliveryPartner: (id, reason) =>
    api.put(`/admin/delivery-partners/${id}/reject`, { reason }),
  setDeliveryPartnerStatus: (id, action) =>
    api.put(`/admin/delivery-partners/${id}/status`, { action }),
  // Admin team / RBAC 2.0 (Phase 5, P5-1)
  getTeam: () => api.get("/admin/team"),
  createTeamMember: (payload) => api.post("/admin/team", payload),
  updateTeamRole: (id, adminRole) => api.put(`/admin/team/${id}/role`, { adminRole }),
  // Audit trail (Phase 5, P5-1)
  getAudit: (params) => api.get("/audit", { params }),
};
