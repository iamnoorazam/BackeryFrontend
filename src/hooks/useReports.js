import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/reports.api";

export const useReportList = () =>
  useQuery({
    queryKey: ["reports-list"],
    queryFn: () => reportsApi.list().then((r) => r.data.data),
    staleTime: 5 * 60_000,
  });

export const useReport = (type, params, enabled = true) =>
  useQuery({
    queryKey: ["report", type, params],
    queryFn: () => reportsApi.run(type, params).then((r) => r.data.data),
    enabled: enabled && !!type,
    keepPreviousData: true,
  });
