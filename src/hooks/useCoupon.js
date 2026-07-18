import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "@/api/coupon.api";
import { useAuth } from "@/store/authStore";

// --- Merchant coupon management (Phase 3, M7) ---
export const useMyCoupons = () =>
  useQuery({
    queryKey: ["my-coupons"],
    queryFn: () => couponApi.listMine().then((r) => r.data.data),
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => couponApi.createMine(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-coupons"] }),
  });
};

export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => couponApi.updateMine(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-coupons"] }),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => couponApi.deleteMine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-coupons"] }),
  });
};

// One-shot apply used by the "Apply" button.
export const useApplyCoupon = () =>
  useMutation({
    mutationFn: (code) => couponApi.apply(code).then((r) => r.data.data),
  });

// Keeps the applied coupon's discount in sync with the current cart. `cartSig`
// changes whenever cart contents change, re-previewing the code (and surfacing
// an error if the coupon no longer applies).
export const useAppliedCoupon = (code, cartSig) => {
  const { user, isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["applied-coupon", code, cartSig],
    queryFn: () => couponApi.apply(code).then((r) => r.data.data),
    enabled: !!code && isLoggedIn && user?.role === "customer",
    retry: false,
  });
};
