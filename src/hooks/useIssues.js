import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issueApi } from "@/api/issue.api";

export const useIssues = (status) =>
  useQuery({
    queryKey: ["issues", status],
    queryFn: () => issueApi.getAll(status).then((r) => r.data.data),
  });

export const useIssueStats = () =>
  useQuery({
    queryKey: ["issue-stats"],
    queryFn: () => issueApi.getStats().then((r) => r.data.data),
    refetchInterval: 30000,
  });

export const useCreateIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => issueApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["issues"] }),
  });
};

export const useUpdateIssueStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => issueApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["issue-stats"] });
    },
  });
};

export const useDeleteIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => issueApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["issue-stats"] });
    },
  });
};
