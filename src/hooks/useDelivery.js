import { useQuery, useMutation } from "@tanstack/react-query";
import { deliveryApi } from "@/api/delivery.api";

export const useStoreInfo = () =>
  useQuery({
    queryKey: ["store-info"],
    queryFn: () => deliveryApi.getStoreInfo().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

export const useGeocode = () =>
  useMutation({
    mutationFn: (address) => deliveryApi.geocodeAddress(address).then((r) => r.data.data),
  });

export const useCalculateDelivery = () =>
  useMutation({
    mutationFn: (data) => deliveryApi.calculateDelivery(data).then((r) => r.data.data),
  });
