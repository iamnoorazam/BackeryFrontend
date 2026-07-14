import api from "./axios";

export const deliveryApi = {
  getStoreInfo: () => api.get("/delivery/store-info"),
  geocodeAddress: (address) => api.post("/delivery/geocode", { address }),
  geocodeByPlaceId: (place_id) => api.post("/delivery/geocode-by-place", { place_id }),
  calculateDelivery: (data) => api.post("/delivery/calculate", data),
  getDistance: (data) => api.post("/delivery/distance", data),
};
