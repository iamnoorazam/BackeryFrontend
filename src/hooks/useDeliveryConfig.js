import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryConfigApi } from "@/api/deliveryConfig.api";

export const useZones = (active) =>
  useQuery({
    queryKey: ["zones", active],
    queryFn: () => deliveryConfigApi.zones(active).then((r) => r.data.data),
  });

export const useAdminIncentives = () =>
  useQuery({
    queryKey: ["incentives"],
    queryFn: () => deliveryConfigApi.incentives().then((r) => r.data.data),
  });

export const useActiveIncentives = () =>
  useQuery({
    queryKey: ["incentives-active"],
    queryFn: () => deliveryConfigApi.activeIncentives().then((r) => r.data.data),
  });

const invalidator = (qc, keys) => () =>
  keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

export const useCreateZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => deliveryConfigApi.createZone(data),
    onSuccess: invalidator(qc, ["zones"]),
  });
};

export const useDeleteZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deliveryConfigApi.deleteZone(id),
    onSuccess: invalidator(qc, ["zones"]),
  });
};

export const useCreateIncentive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => deliveryConfigApi.createIncentive(data),
    onSuccess: invalidator(qc, ["incentives", "incentives-active"]),
  });
};

export const useDeleteIncentive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deliveryConfigApi.deleteIncentive(id),
    onSuccess: invalidator(qc, ["incentives", "incentives-active"]),
  });
};
