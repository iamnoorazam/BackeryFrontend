import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutApi } from "@/api/payout.api";

export const useEarnings = () =>
  useQuery({
    queryKey: ["earnings"],
    queryFn: () => payoutApi.earnings().then((r) => r.data.data),
  });

export const useMyPayouts = () =>
  useQuery({ queryKey: ["my-payouts"], queryFn: () => payoutApi.mine().then((r) => r.data.data) });

export const useRequestPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount) => payoutApi.request(amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["earnings"] });
      qc.invalidateQueries({ queryKey: ["my-payouts"] });
    },
  });
};

export const useAdminPayouts = (status) =>
  useQuery({
    queryKey: ["admin-payouts", status],
    queryFn: () => payoutApi.adminList(status).then((r) => r.data.data),
  });

export const useProcessPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }) => payoutApi.process(id, action, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payouts"] }),
  });
};
