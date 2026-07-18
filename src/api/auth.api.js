import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  adminLogin: (data) => api.post("/auth/admin-login", data),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  logoutAll: () => api.post("/auth/logout-all"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};
