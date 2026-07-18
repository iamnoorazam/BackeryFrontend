import api from "./axios";

export const supportApi = {
  // Requester
  createTicket: (d) => api.post("/support/tickets", d),
  myTickets: () => api.get("/support/tickets/mine"),
  myTicket: (id) => api.get(`/support/tickets/mine/${id}`),
  replyMine: (id, body) => api.post(`/support/tickets/mine/${id}/reply`, { body }),
  // Support team
  analytics: () => api.get("/support/admin/analytics"),
  listTickets: (params) => api.get("/support/admin/tickets", { params }),
  getTicket: (id) => api.get(`/support/admin/tickets/${id}`),
  reply: (id, body, isInternal) =>
    api.post(`/support/admin/tickets/${id}/reply`, { body, isInternal }),
  update: (id, d) => api.put(`/support/admin/tickets/${id}`, d),
};
