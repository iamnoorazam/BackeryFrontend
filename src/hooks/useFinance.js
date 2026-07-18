import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeApi } from "@/api/finance.api";

export const useFinanceOverview = () =>
  useQuery({
    queryKey: ["finance-overview"],
    queryFn: () => financeApi.overview().then((r) => r.data.data),
    refetchInterval: 30000,
  });

export const useLedger = (limit = 50) =>
  useQuery({
    queryKey: ["finance-ledger", limit],
    queryFn: () => financeApi.ledger(limit).then((r) => r.data.data),
  });

export const useRefunds = (status) =>
  useQuery({
    queryKey: ["finance-refunds", status],
    queryFn: () => financeApi.refunds(status).then((r) => r.data.data),
  });

export const useActOnRefund = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }) => financeApi.actOnRefund(id, action, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-refunds"] });
      qc.invalidateQueries({ queryKey: ["finance-overview"] });
    },
  });
};

export const useFailedPayments = () =>
  useQuery({
    queryKey: ["finance-failed-payments"],
    queryFn: () => financeApi.failedPayments().then((r) => r.data.data),
  });

export const useRetryPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => financeApi.retryPayment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance-failed-payments"] }),
  });
};
