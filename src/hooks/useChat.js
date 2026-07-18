import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/api/chat.api";

export const useConversations = () =>
  useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.conversations().then((r) => r.data.data),
  });

export const useMessages = (conversationId) =>
  useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => chatApi.messages(conversationId).then((r) => r.data.data),
    enabled: !!conversationId,
  });

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, text }) => chatApi.send(conversationId, text),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
