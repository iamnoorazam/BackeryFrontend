import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  });

export const useAdminUsers = (role) =>
  useQuery({
    queryKey: ["admin-users", role],
    queryFn: () => adminApi.getUsers(role).then((r) => r.data.data),
  });

export const useBlockUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isBlocked }) => adminApi.blockUnblock(id, isBlocked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

export const useApproveOwner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.approveOwner(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};
