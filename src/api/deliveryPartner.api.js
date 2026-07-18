import api from "./axios";

// Delivery-partner self-service onboarding (Phase 4, D1). `updateMe` accepts a
// plain object (KYC/vehicle/bank/address sent as nested JSON) or a FormData
// (when uploading profile photo / selfie / cheque / vehicle images).
export const deliveryPartnerApi = {
  register: (data) => api.post("/delivery-partner/register", data),
  getMe: () => api.get("/delivery-partner/me"),
  updateMe: (data) => api.put("/delivery-partner/me", data),
  submit: () => api.post("/delivery-partner/submit"),
  // Availability + live location (Phase 4, D2)
  setAvailability: (status) => api.patch("/delivery-partner/availability", { status }),
  updateLocation: (coords) => api.patch("/delivery-partner/location", coords),
  // Performance analytics + shift summary (Phase 4, D7)
  analytics: () => api.get("/delivery-partner/analytics"),
};
