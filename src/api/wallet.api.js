import api from "./axios";

export const walletApi = {
  get: () => api.get("/wallet"),
};
