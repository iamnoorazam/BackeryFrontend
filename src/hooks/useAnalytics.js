import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics.api";

export const useSalesSummary = (period) =>
  useQuery({
    queryKey: ["analytics-summary", period],
    queryFn: () => analyticsApi.summary(period).then((r) => r.data.data),
  });

export const useSalesSeries = (period) =>
  useQuery({
    queryKey: ["analytics-sales", period],
    queryFn: () => analyticsApi.sales(period).then((r) => r.data.data),
  });

export const useTopProducts = (period, order = "desc") =>
  useQuery({
    queryKey: ["analytics-top", period, order],
    queryFn: () => analyticsApi.topProducts(period, order).then((r) => r.data.data),
  });
