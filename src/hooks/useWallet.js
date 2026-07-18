import { useQuery } from "@tanstack/react-query";
import { walletApi } from "@/api/wallet.api";
import { useAuth } from "@/store/authStore";

// Customer store-credit wallet: balance + recent transactions.
export const useWallet = () => {
  const { user, isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletApi.get().then((r) => r.data.data),
    enabled: isLoggedIn && user?.role === "customer",
  });
};
