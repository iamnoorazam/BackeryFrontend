import api from "./axios";

// Super-admin Notification Center (Phase 5, P5-8): templates + multi-channel
// campaigns. Distinct from notification.api.js (the customer's notification bell).
export const notificationCenterApi = {
  channels: () => api.get("/notification-center/channels"),
  overview: () => api.get("/notification-center/overview"),
  // Templates
  listTemplates: () => api.get("/notification-center/templates"),
  createTemplate: (d) => api.post("/notification-center/templates", d),
  updateTemplate: (id, d) => api.put(`/notification-center/templates/${id}`, d),
  deleteTemplate: (id) => api.delete(`/notification-center/templates/${id}`),
  // Campaigns
  listCampaigns: () => api.get("/notification-center/campaigns"),
  getCampaign: (id) => api.get(`/notification-center/campaigns/${id}`),
  createCampaign: (d) => api.post("/notification-center/campaigns", d),
  updateCampaign: (id, d) => api.put(`/notification-center/campaigns/${id}`, d),
  deleteCampaign: (id) => api.delete(`/notification-center/campaigns/${id}`),
  previewAudience: (audience) => api.post("/notification-center/campaigns/preview", audience),
  sendCampaign: (id) => api.post(`/notification-center/campaigns/${id}/send`),
};
