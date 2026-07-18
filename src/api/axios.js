import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Endpoints that must never trigger a refresh-and-retry (a 401 from them is a
// real credential failure, and /auth/refresh 401-ing means the session is gone).
const AUTH_ENDPOINTS = ["/auth/login", "/auth/admin-login", "/auth/register", "/auth/refresh"];

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const redirectToLogin = () => {
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

// A single in-flight refresh shared by every request that 401s concurrently, so
// a burst of expired-token requests triggers exactly one /auth/refresh rotation
// (a stampede of refreshes would rotate the token repeatedly and log the user
// out via reuse-detection). Uses a bare axios call so its own errors can't
// recurse back through this interceptor.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return Promise.reject(new Error("No refresh token"));

  refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken })
    .then((res) => {
      const { token, refreshToken: rotated } = res.data.data;
      localStorage.setItem("token", token);
      if (rotated) localStorage.setItem("refreshToken", rotated);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, code, message, config } = error;
    const status = response?.status;
    const errorData = response?.data;

    // Handle network errors
    if (code === "ECONNABORTED" || code === "ERR_NETWORK") {
      error.userMessage = "Network error. Please check your connection";
      error.type = "network";
      return Promise.reject(error);
    }

    const isAuthEndpoint = AUTH_ENDPOINTS.includes(config?.url);

    // Handle 401 Unauthorized: the access token is likely just expired. Try one
    // silent refresh-and-retry before giving up. Skipped for auth endpoints and
    // for a request we've already retried once.
    if (status === 401 && !isAuthEndpoint) {
      if (!config?._retry) {
        config._retry = true;
        try {
          const newToken = await refreshAccessToken();
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
          return api(config);
        } catch {
          // fall through to the hard-logout below
        }
      }
      clearSession();
      redirectToLogin();
      error.userMessage = "Your session has expired. Please login again";
      error.type = "auth";
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (status === 403) {
      error.userMessage =
        errorData?.message ||
        "You don't have permission to perform this action";
      error.type = "forbidden";
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (status === 404) {
      error.userMessage =
        errorData?.message || "The requested resource was not found";
      error.type = "notfound";
      return Promise.reject(error);
    }

    // Handle 409 Conflict
    if (status === 409) {
      error.userMessage = errorData?.message || "This item already exists";
      error.type = "conflict";
      return Promise.reject(error);
    }

    // Handle 422 Validation Error
    if (status === 422) {
      error.userMessage = "Validation error. Please check your input";
      error.errors = errorData?.errors;
      error.type = "validation";
      return Promise.reject(error);
    }

    // Handle 500 Server Error
    if (status >= 500) {
      error.userMessage = "Server error. Please try again later";
      error.type = "server";
      return Promise.reject(error);
    }

    // Handle 4xx Client Errors
    if (status >= 400) {
      error.userMessage =
        errorData?.message || "An error occurred. Please try again";
      error.type = "client";
      return Promise.reject(error);
    }

    // Fallback error message
    error.userMessage = message || "An unexpected error occurred";
    error.type = "unknown";

    return Promise.reject(error);
  },
);

export default api;
