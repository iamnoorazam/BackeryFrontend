import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "@/api/vendor.api";

export const useVendors = (params, options = {}) =>
  useQuery({
    queryKey: ["vendors", params],
    queryFn: () => vendorApi.getAll(params).then((r) => r.data.data),
    ...options,
  });

export const useVendor = (id) =>
  useQuery({
    queryKey: ["vendor", id],
    queryFn: () => vendorApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useVendorBySlug = (slug) =>
  useQuery({
    queryKey: ["vendor", "slug", slug],
    queryFn: () => vendorApi.getBySlug(slug).then((r) => r.data.data),
    enabled: !!slug,
  });

// The authenticated seller's own store.
export const useMyStore = (options = {}) =>
  useQuery({
    queryKey: ["my-store"],
    queryFn: () => vendorApi.getMyStore().then((r) => r.data.data),
    ...options,
  });

export const useCreateVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => vendorApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      qc.invalidateQueries({ queryKey: ["my-store"] });
    },
  });
};

export const useUpdateVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => vendorApi.update(id, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      qc.invalidateQueries({ queryKey: ["vendor", vars?.id] });
      qc.invalidateQueries({ queryKey: ["my-store"] });
    },
  });
};
