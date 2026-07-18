import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fraudApi } from "@/api/fraud.api";

const KEYS = {
  overview: ["fraud-overview"],
  risky: (p) => ["fraud-risky", p],
  flags: (p) => ["fraud-flags", p],
  flag: (id) => ["fraud-flag", id],
};

export const useRiskOverview = () =>
  useQuery({
    queryKey: KEYS.overview,
    queryFn: () => fraudApi.overview().then((r) => r.data.data),
  });

export const useRiskyCustomers = (params) =>
  useQuery({
    queryKey: KEYS.risky(params),
    queryFn: () => fraudApi.riskyCustomers(params).then((r) => r.data.data),
  });

export const useRiskFlags = (params) =>
  useQuery({
    queryKey: KEYS.flags(params),
    queryFn: () => fraudApi.listFlags(params).then((r) => r.data.data),
  });

export const useRiskFlag = (id) =>
  useQuery({
    queryKey: KEYS.flag(id),
    queryFn: () => fraudApi.getFlag(id).then((r) => r.data.data),
    enabled: !!id,
  });

// Invalidate every fraud surface after a mutation (small, cheap set).
const useFraudMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fraud-overview"] });
      qc.invalidateQueries({ queryKey: ["fraud-flags"] });
      qc.invalidateQueries({ queryKey: ["fraud-risky"] });
    },
  });
};

export const useRunRules = () => useFraudMutation(() => fraudApi.runRules());
export const useCreateFlag = () => useFraudMutation((d) => fraudApi.createFlag(d));
export const useActOnFlag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => fraudApi.actOnFlag(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["fraud-overview"] });
      qc.invalidateQueries({ queryKey: ["fraud-flags"] });
      qc.invalidateQueries({ queryKey: KEYS.flag(id) });
    },
  });
};
