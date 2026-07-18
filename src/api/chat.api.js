import api from "./axios";

export const chatApi = {
  start: (userId) => api.post("/chat/start", { userId }),
  conversations: () => api.get("/chat/conversations"),
  messages: (id) => api.get(`/chat/${id}/messages`),
  send: (id, text) => api.post(`/chat/${id}/messages`, { text }),
  markRead: (id) => api.put(`/chat/${id}/read`),
};
