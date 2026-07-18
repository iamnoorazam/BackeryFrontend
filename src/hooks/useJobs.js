import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";

export const useJobsHealth = () =>
  useQuery({
    queryKey: ["jobs-health"],
    queryFn: () => jobsApi.health().then((r) => r.data.data),
    refetchInterval: 15000,
  });

export const useJobRuns = (params) =>
  useQuery({
    queryKey: ["jobs-runs", params],
    queryFn: () => jobsApi.runs(params).then((r) => r.data.data),
    refetchInterval: 15000,
  });

export const useTriggerJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name) => jobsApi.trigger(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs-runs"] });
      qc.invalidateQueries({ queryKey: ["jobs-health"] });
    },
  });
};
