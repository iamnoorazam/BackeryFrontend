import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/api/product.api";

export const useProducts = (params, options = {}) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: () => productApi.getAll(params).then((r) => r.data.data),
    refetchOnMount: "always",
    ...options,
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => productApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["owner-products"] });
      qc.invalidateQueries({ queryKey: ["owner-dashboard"] });
    },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["owner-products"] });
      qc.invalidateQueries({ queryKey: ["owner-dashboard"] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["owner-products"] });
      qc.invalidateQueries({ queryKey: ["owner-dashboard"] });
    },
  });
};

export const useSetAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }) => productApi.setAvailability(id, isAvailable),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["owner-products"] });
    },
  });
};
