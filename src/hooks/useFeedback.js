import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackApi } from "@/api/feedback.api";

export const useFeedback = () =>
  useQuery({
    queryKey: ["feedback"],
    queryFn: () => feedbackApi.getAll().then((r) => r.data.data),
  });

export const useCreateFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => feedbackApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedback"] }),
  });
};

export const useDeleteFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => feedbackApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedback"] }),
  });
};
