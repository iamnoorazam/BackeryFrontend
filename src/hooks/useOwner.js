import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerApi } from "@/api/owner.api";

export const useOwnerDashboard = () =>
  useQuery({
    queryKey: ["owner-dashboard"],
    queryFn: () => ownerApi.getDashboard().then((r) => r.data.data),
    refetchOnMount: "always",
  });

export const useOwnerOrders = () =>
  useQuery({
    queryKey: ["owner-orders"],
    queryFn: () => ownerApi.getOrders().then((r) => r.data.data),
  });

export const useOwnerProducts = () =>
  useQuery({
    queryKey: ["owner-products"],
    queryFn: () => ownerApi.getProducts().then((r) => r.data.data),
    refetchOnMount: "always",
  });

export const useOwnerUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => ownerApi.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-orders"] }),
  });
};
