import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "@/api/support.api";

export const useSupportAnalytics = () =>
  useQuery({
    queryKey: ["support-analytics"],
    queryFn: () => supportApi.analytics().then((r) => r.data.data),
  });

export const useSupportTickets = (params) =>
  useQuery({
    queryKey: ["support-tickets", params],
    queryFn: () => supportApi.listTickets(params).then((r) => r.data.data),
  });

export const useSupportTicket = (id) =>
  useQuery({
    queryKey: ["support-ticket", id],
    queryFn: () => supportApi.getTicket(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useReplyTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body, isInternal }) => supportApi.reply(id, body, isInternal),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["support-ticket", id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
};

export const useUpdateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => supportApi.update(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["support-ticket", id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      qc.invalidateQueries({ queryKey: ["support-analytics"] });
    },
  });
};
