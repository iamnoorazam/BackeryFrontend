import api from "./axios";

// Merchant self-service onboarding (Phase 3, M1). `updateMyStore` accepts a
// plain object (KYC/bank/address sent as nested JSON) or a FormData (when
// uploading logo/banner/cheque).
export const merchantApi = {
  register: (data) => api.post("/merchant/register", data),
  getMyStore: () => api.get("/merchant/me"),
  updateMyStore: (data) => api.put("/merchant/me", data),
  submit: () => api.post("/merchant/submit"),
  setStatus: (data) => api.patch("/merchant/status", data),
};
