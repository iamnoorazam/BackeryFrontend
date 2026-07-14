import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000, // 10 second timeout
});

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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, code, message } = error;
    const status = response?.status;
    const errorData = response?.data;

    // Handle network errors
    if (code === "ECONNABORTED" || code === "ERR_NETWORK") {
      error.userMessage = "Network error. Please check your connection";
      error.type = "network";
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
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
