import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsApi } from "@/api/cms.api";

export const useBanners = () =>
  useQuery({
    queryKey: ["cms-banners"],
    queryFn: () => cmsApi.listBanners().then((r) => r.data.data),
  });
export const usePages = () =>
  useQuery({ queryKey: ["cms-pages"], queryFn: () => cmsApi.listPages().then((r) => r.data.data) });
export const useFaqs = () =>
  useQuery({ queryKey: ["cms-faqs"], queryFn: () => cmsApi.listFaqs().then((r) => r.data.data) });
export const useAnnouncements = () =>
  useQuery({
    queryKey: ["cms-announcements"],
    queryFn: () => cmsApi.listAnnouncements().then((r) => r.data.data),
  });

const useInvalidatingMutation = (key, mutationFn) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => qc.invalidateQueries({ queryKey: [key] }) });
};

export const useCreateBanner = () =>
  useInvalidatingMutation("cms-banners", (d) => cmsApi.createBanner(d));
export const useUpdateBanner = () =>
  useInvalidatingMutation("cms-banners", ({ id, data }) => cmsApi.updateBanner(id, data));
export const useDeleteBanner = () =>
  useInvalidatingMutation("cms-banners", (id) => cmsApi.deleteBanner(id));

export const useUpsertPage = () =>
  useInvalidatingMutation("cms-pages", (d) => cmsApi.upsertPage(d));
export const useDeletePage = () =>
  useInvalidatingMutation("cms-pages", (id) => cmsApi.deletePage(id));

export const useCreateFaq = () => useInvalidatingMutation("cms-faqs", (d) => cmsApi.createFaq(d));
export const useUpdateFaq = () =>
  useInvalidatingMutation("cms-faqs", ({ id, data }) => cmsApi.updateFaq(id, data));
export const useDeleteFaq = () => useInvalidatingMutation("cms-faqs", (id) => cmsApi.deleteFaq(id));

export const useCreateAnnouncement = () =>
  useInvalidatingMutation("cms-announcements", (d) => cmsApi.createAnnouncement(d));
export const useUpdateAnnouncement = () =>
  useInvalidatingMutation("cms-announcements", ({ id, data }) =>
    cmsApi.updateAnnouncement(id, data),
  );
export const useDeleteAnnouncement = () =>
  useInvalidatingMutation("cms-announcements", (id) => cmsApi.deleteAnnouncement(id));
