import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/inventory.api";

export const useInventory = () =>
  useQuery({
    queryKey: ["inventory"],
    queryFn: () => inventoryApi.list().then((r) => r.data.data),
  });

export const useInventoryLogs = (productId, enabled) =>
  useQuery({
    queryKey: ["inventory-logs", productId],
    queryFn: () => inventoryApi.logs(productId).then((r) => r.data.data),
    enabled: !!productId && enabled,
  });

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, change, reason }) => inventoryApi.adjust(productId, change, reason),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-logs", vars.productId] });
      qc.invalidateQueries({ queryKey: ["owner-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
