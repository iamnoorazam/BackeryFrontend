import api from "./axios";

export const couponApi = {
  // Preview a code against the caller's server cart.
  apply: (code) => api.post("/coupons/apply", { code }),
  // Merchant coupon management (owner).
  listMine: () => api.get("/coupons/mine"),
  createMine: (data) => api.post("/coupons/mine", data),
  updateMine: (id, data) => api.put(`/coupons/mine/${id}`, data),
  deleteMine: (id) => api.delete(`/coupons/mine/${id}`),
};
