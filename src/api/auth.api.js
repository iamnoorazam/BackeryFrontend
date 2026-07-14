import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  adminLogin: (data) => api.post("/auth/admin-login", data),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};
