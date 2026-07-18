import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { notificationApi } from "@/api/notification.api";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useAuth } from "@/store/authStore";

export const useNotifications = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user._id);
    const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });
    socket.on("new_order_notification", invalidate);
    socket.on("new_issue_report", invalidate);
    return () => {
      socket.off("new_order_notification", invalidate);
      socket.off("new_issue_report", invalidate);
      disconnectSocket();
    };
  }, [user, qc]);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getAll().then((r) => r.data.data),
    // Dashboard bell for both store owners (own order notifications) and platform
    // admins (issue reports + any store they own).
    enabled: !!user && (user.role === "owner" || user.role === "admin"),
    refetchInterval: 30000,
  });
};

// Customer-facing notifications (Phase 2, Module 7). Same endpoint, but scoped
// to logged-in customers and refreshed live off the customer's own socket
// (order_status_update is emitted to the customer on every status change).
export const useCustomerNotifications = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?._id || user.role !== "customer") return;
    const socket = connectSocket(user._id);
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    };
    socket.on("order_status_update", invalidate);
    return () => {
      socket.off("order_status_update", invalidate);
      disconnectSocket();
    };
  }, [user, qc]);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getAll().then((r) => r.data.data),
    enabled: !!user && user.role === "customer",
    refetchInterval: 60000,
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};
