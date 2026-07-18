import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationCenterApi } from "@/api/notificationCenter.api";

// Explicit hooks (no factory-returning-hooks — keeps rules-of-hooks honest, same
// convention as useCms). Invalidations refresh the affected lists + overview.
const KEYS = {
  overview: ["nc-overview"],
  templates: ["nc-templates"],
  campaigns: ["nc-campaigns"],
  campaign: (id) => ["nc-campaign", id],
};

export const useNcOverview = () =>
  useQuery({
    queryKey: KEYS.overview,
    queryFn: () => notificationCenterApi.overview().then((r) => r.data.data),
  });

export const useNcChannels = () =>
  useQuery({
    queryKey: ["nc-channels"],
    queryFn: () => notificationCenterApi.channels().then((r) => r.data.data.channels),
    staleTime: Infinity,
  });

export const useNcTemplates = () =>
  useQuery({
    queryKey: KEYS.templates,
    queryFn: () => notificationCenterApi.listTemplates().then((r) => r.data.data),
  });

export const useNcCampaigns = () =>
  useQuery({
    queryKey: KEYS.campaigns,
    queryFn: () => notificationCenterApi.listCampaigns().then((r) => r.data.data),
  });

export const useNcCampaign = (id) =>
  useQuery({
    queryKey: KEYS.campaign(id),
    queryFn: () => notificationCenterApi.getCampaign(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d) => notificationCenterApi.createTemplate(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.templates });
      qc.invalidateQueries({ queryKey: KEYS.overview });
    },
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationCenterApi.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.templates });
      qc.invalidateQueries({ queryKey: KEYS.overview });
    },
  });
};

export const useCreateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d) => notificationCenterApi.createCampaign(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.campaigns });
      qc.invalidateQueries({ queryKey: KEYS.overview });
    },
  });
};

export const useDeleteCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationCenterApi.deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.campaigns });
      qc.invalidateQueries({ queryKey: KEYS.overview });
    },
  });
};

export const useSendCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationCenterApi.sendCampaign(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: KEYS.campaigns });
      qc.invalidateQueries({ queryKey: KEYS.campaign(id) });
      qc.invalidateQueries({ queryKey: KEYS.overview });
    },
  });
};

export const usePreviewAudience = () =>
  useMutation({
    mutationFn: (audience) =>
      notificationCenterApi.previewAudience(audience).then((r) => r.data.data),
  });
