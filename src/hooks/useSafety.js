import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safetyApi } from "@/api/safety.api";

export const useRaiseSos = () => useMutation({ mutationFn: (body) => safetyApi.sos(body) });

export const useReportIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => safetyApi.incident(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["safety-mine"] }),
  });
};

export const useAdminSafetyAlerts = (status) =>
  useQuery({
    queryKey: ["admin-safety", status],
    queryFn: () => safetyApi.adminList(status).then((r) => r.data.data),
    refetchInterval: 15000,
  });

export const useResolveSafetyAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }) => safetyApi.adminResolve(id, action, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-safety"] }),
  });
};
