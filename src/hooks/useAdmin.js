import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  });

// Super Admin Command Center (Phase 5, P5-2). Auto-refreshes for live ops.
export const useCommandCenter = () =>
  useQuery({
    queryKey: ["admin-command-center"],
    queryFn: () => adminApi.getCommandCenter().then((r) => r.data.data),
    refetchInterval: 20000,
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

export const useLoginHistory = () =>
  useQuery({
    queryKey: ["admin-login-history"],
    queryFn: () => adminApi.getLoginHistory().then((r) => r.data.data),
  });

// User Management 360 (Phase 5, P5-3)
export const useUserProfile = (id) =>
  useQuery({
    queryKey: ["admin-user-profile", id],
    queryFn: () => adminApi.getUserProfile(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useGdprEraseUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.gdprEraseUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

// Merchant onboarding review (Phase 3, M1)
export const useAdminVendors = (status) =>
  useQuery({
    queryKey: ["admin-vendors", status],
    queryFn: () => adminApi.getVendors(status).then((r) => r.data.data),
  });

export const useApproveVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.approveVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vendors"] }),
  });
};

export const useRejectVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectVendor(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vendors"] }),
  });
};

// Delivery-partner onboarding review (Phase 4, D1)
export const useAdminDeliveryPartners = (status) =>
  useQuery({
    queryKey: ["admin-delivery-partners", status],
    queryFn: () => adminApi.getDeliveryPartners(status).then((r) => r.data.data),
  });

export const useApproveDeliveryPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.approveDeliveryPartner(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-delivery-partners"] }),
  });
};

export const useRejectDeliveryPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectDeliveryPartner(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-delivery-partners"] }),
  });
};

export const useSetDeliveryPartnerStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => adminApi.setDeliveryPartnerStatus(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-delivery-partners"] }),
  });
};

// --- Admin team / RBAC 2.0 (Phase 5, P5-1) ----------------------------------
export const useAdminTeam = () =>
  useQuery({
    queryKey: ["admin-team"],
    queryFn: () => adminApi.getTeam().then((r) => r.data.data),
  });

export const useCreateTeamMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminApi.createTeamMember(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-team"] }),
  });
};

export const useUpdateTeamRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRole }) => adminApi.updateTeamRole(id, adminRole),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-team"] }),
  });
};

// --- Audit trail (Phase 5, P5-1) --------------------------------------------
export const useAuditLog = (params) =>
  useQuery({
    queryKey: ["admin-audit", params],
    queryFn: () => adminApi.getAudit(params).then((r) => r.data.data),
    keepPreviousData: true,
  });
