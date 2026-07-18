import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { riderEarningsApi } from "@/api/riderEarnings.api";

export const useRiderEarnings = () =>
  useQuery({
    queryKey: ["rider-earnings"],
    queryFn: () => riderEarningsApi.earnings().then((r) => r.data.data),
  });

export const useMyRiderPayouts = () =>
  useQuery({
    queryKey: ["rider-payouts-mine"],
    queryFn: () => riderEarningsApi.mine().then((r) => r.data.data),
  });

export const useRequestRiderPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, method }) => riderEarningsApi.request(amount, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rider-earnings"] });
      qc.invalidateQueries({ queryKey: ["rider-payouts-mine"] });
    },
  });
};

export const useAdminRiderPayouts = (status) =>
  useQuery({
    queryKey: ["admin-rider-payouts", status],
    queryFn: () => riderEarningsApi.adminList(status).then((r) => r.data.data),
  });

export const useProcessRiderPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }) => riderEarningsApi.process(id, action, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rider-payouts"] }),
  });
};
