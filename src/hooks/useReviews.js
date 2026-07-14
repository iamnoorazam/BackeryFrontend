import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/api/review.api";

export const useReviews = (productId) =>
  useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewApi.getByProduct(productId).then((r) => r.data.data),
    enabled: !!productId,
  });

export const useAddReview = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => reviewApi.add(productId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
};

export const useDeleteReview = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reviewApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews", productId] }),
  });
};
