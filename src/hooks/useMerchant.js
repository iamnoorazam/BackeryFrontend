import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { merchantApi } from "@/api/merchant.api";

export const useMyStore = (enabled = true) =>
  useQuery({
    queryKey: ["merchant-store"],
    queryFn: () => merchantApi.getMyStore().then((r) => r.data.data),
    enabled,
  });

export const useUpdateMyStore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => merchantApi.updateMyStore(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchant-store"] }),
  });
};

export const useSubmitForReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => merchantApi.submit(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchant-store"] }),
  });
};

export const useSetStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => merchantApi.setStatus(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchant-store"] }),
  });
};
