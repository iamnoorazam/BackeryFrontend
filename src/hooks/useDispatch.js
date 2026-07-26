import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dispatchApi } from "@/api/dispatch.api";

export const useRequestRider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => dispatchApi.requestRider(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};

// Rider: pending offers + active assignments.
export const useMyOffers = () =>
  useQuery({
    queryKey: ["dispatch-offers"],
    queryFn: () => dispatchApi.myOffers().then((r) => r.data.data),
  });

export const useMyAssignments = () =>
  useQuery({
    queryKey: ["dispatch-assignments"],
    queryFn: () => dispatchApi.myAssignments().then((r) => r.data.data),
  });

export const useAcceptOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => dispatchApi.accept(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dispatch-offers"] });
      qc.invalidateQueries({ queryKey: ["dispatch-assignments"] });
      qc.invalidateQueries({ queryKey: ["delivery-partner-me"] });
    },
  });
};

export const useRejectOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => dispatchApi.reject(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dispatch-offers"] }),
  });
};

// Customer live-tracking snapshot (D5). Refetches periodically as a fallback to
// the socket stream; the moving rider marker itself is driven by sockets.
export const useOrderTracking = (orderId, enabled = true) =>
  useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: () => dispatchApi.track(orderId).then((r) => r.data.data),
    enabled: !!orderId && enabled,
    refetchInterval: 30000,
  });

// --- Admin delivery operations (D8) ---
export const useAdminRiders = (status) =>
  useQuery({
    queryKey: ["admin-riders", status],
    queryFn: () => dispatchApi.adminRiders(status).then((r) => r.data.data),
    refetchInterval: 15000,
  });

export const useAdminActiveOrders = () =>
  useQuery({
    queryKey: ["admin-active-orders"],
    queryFn: () => dispatchApi.adminActiveOrders().then((r) => r.data.data),
    refetchInterval: 15000,
  });

export const useAdminAssignRider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, partnerId }) => dispatchApi.adminAssign(orderId, partnerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-active-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-riders"] });
    },
  });
};

// Live trip step (D4): arrived-pickup | pickup | arrived-drop | verify-otp | fail.
export const useTripAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, step, body }) => dispatchApi.trip(orderId, step, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dispatch-assignments"] });
      qc.invalidateQueries({ queryKey: ["delivery-partner-me"] });
    },
  });
};
