import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerApi } from "@/api/deliveryPartner.api";

export const useMyPartnerProfile = (enabled = true) =>
  useQuery({
    queryKey: ["delivery-partner-me"],
    queryFn: () => deliveryPartnerApi.getMe().then((r) => r.data.data),
    enabled,
  });

export const useUpdateMyPartnerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => deliveryPartnerApi.updateMe(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-partner-me"] }),
  });
};

export const useMyPartnerAnalytics = () =>
  useQuery({
    queryKey: ["delivery-partner-analytics"],
    queryFn: () => deliveryPartnerApi.analytics().then((r) => r.data.data),
  });

export const useSubmitPartnerForReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deliveryPartnerApi.submit(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-partner-me"] }),
  });
};

// Availability toggle (Phase 4, D2). Optimistically updates the cached profile
// so the status pill flips instantly.
export const useSetAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status) => deliveryPartnerApi.setAvailability(status),
    onSuccess: (res, status) => {
      qc.setQueryData(["delivery-partner-me"], (prev) =>
        prev ? { ...prev, availabilityStatus: status } : prev,
      );
    },
  });
};

// Fire-and-forget location ping (Phase 4, D2). No cache churn — the watcher
// calls this frequently.
export const useUpdateLocation = () =>
  useMutation({
    mutationFn: (coords) => deliveryPartnerApi.updateLocation(coords),
  });
