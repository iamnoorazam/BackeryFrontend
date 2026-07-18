import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/api/search.api";

/** Debounce any fast-changing value (e.g. a search input). */
export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// Unified quick search (stores + dishes + categories).
export const useUnifiedSearch = (q, { limit = 8, enabled = true } = {}) =>
  useQuery({
    queryKey: ["search", "unified", q, limit],
    queryFn: () => searchApi.unified({ q, limit }).then((r) => r.data.data),
    enabled: enabled && !!q && q.trim().length >= 1,
    keepPreviousData: true,
    staleTime: 30_000,
  });

export const useTrending = () =>
  useQuery({
    queryKey: ["search", "trending"],
    queryFn: () => searchApi.trending().then((r) => r.data.data),
    staleTime: 5 * 60_000,
  });

// Admin search analytics (Phase 5, P5-11) — top queries, zero-result demand.
export const useSearchAnalytics = (days = 30) =>
  useQuery({
    queryKey: ["search", "analytics", days],
    queryFn: () => searchApi.analytics(days).then((r) => r.data.data),
  });
