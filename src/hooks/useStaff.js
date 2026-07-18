import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/api/staff.api";

export const useStaff = () =>
  useQuery({
    queryKey: ["staff"],
    queryFn: () => staffApi.list().then((r) => r.data.data),
  });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => staffApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => staffApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
};
