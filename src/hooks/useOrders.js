import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/order.api";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useAuth } from "@/store/authStore";

// Live order tracking for customers: subscribe to server-pushed status changes
// and refresh the order list/detail so the tracker updates without a reload.
export const useOrderStatusStream = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);
    const onUpdate = (payload) => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      if (payload?.orderId) qc.invalidateQueries({ queryKey: ["order", payload.orderId] });
    };
    socket.on("order_status_update", onUpdate);
    return () => {
      socket.off("order_status_update", onUpdate);
      disconnectSocket();
    };
  }, [user, qc]);
};

export const useMyOrders = () =>
  useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.getMyOrders().then((r) => r.data.data),
  });

export const useOrder = (id) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useAllOrders = () =>
  useQuery({
    queryKey: ["all-orders"],
    queryFn: () => orderApi.getAll().then((r) => r.data.data),
  });

export const usePlaceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.place(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deliveryAddress }) => orderApi.updateAddress(id, deliveryAddress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-orders"] }),
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => orderApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-orders"] }),
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => orderApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
};

export const useGenerateOtp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => orderApi.generateOtp(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useVerifyOtp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }) => orderApi.verifyOtp(id, otp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useDeliveryOtp = (id) =>
  useQuery({
    queryKey: ["delivery-otp", id],
    queryFn: () => orderApi.getDeliveryOtp(id).then((r) => r.data.data),
    enabled: !!id,
    refetchInterval: 10000,
  });
