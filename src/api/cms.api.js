import api from "./axios";

export const cmsApi = {
  // Admin
  listBanners: () => api.get("/cms/banners"),
  createBanner: (d) => api.post("/cms/banners", d),
  updateBanner: (id, d) => api.put(`/cms/banners/${id}`, d),
  deleteBanner: (id) => api.delete(`/cms/banners/${id}`),
  listPages: () => api.get("/cms/pages"),
  upsertPage: (d) => api.post("/cms/pages", d),
  deletePage: (id) => api.delete(`/cms/pages/${id}`),
  listFaqs: () => api.get("/cms/faqs"),
  createFaq: (d) => api.post("/cms/faqs", d),
  updateFaq: (id, d) => api.put(`/cms/faqs/${id}`, d),
  deleteFaq: (id) => api.delete(`/cms/faqs/${id}`),
  listAnnouncements: () => api.get("/cms/announcements"),
  createAnnouncement: (d) => api.post("/cms/announcements", d),
  updateAnnouncement: (id, d) => api.put(`/cms/announcements/${id}`, d),
  deleteAnnouncement: (id) => api.delete(`/cms/announcements/${id}`),
  // Public
  publicPage: (slug) => api.get(`/cms/public/pages/${slug}`),
};
