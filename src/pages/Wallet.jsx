import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Gift, RotateCcw, ShieldCheck } from "lucide-react";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useWallet } from "@/hooks/useWallet";
import { formatPrice, formatDate } from "@/lib/utils";

const REASON_META = {
  cashback: { label: "Cashback", Icon: Gift },
  refund: { label: "Refund", Icon: RotateCcw },
  admin: { label: "Credit", Icon: ShieldCheck },
  order_redemption: { label: "Used at checkout", Icon: ArrowUpRight },
  adjustment: { label: "Adjustment", Icon: WalletIcon },
};

const Wallet = () => {
  const { data, isLoading } = useWallet();
  const balance = data?.balance || 0;
  const transactions = data?.transactions || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-8"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">My Wallet</h1>
      <p className="text-stone-400 text-sm mb-5">Store credit you can spend at checkout</p>

      {/* Balance card */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#D2691E] to-[#A0522D] text-white shadow-elevated">
        <div className="flex items-center gap-2 text-white/80 text-xs font-medium uppercase tracking-wider">
          <WalletIcon className="h-4 w-4" /> Available balance
        </div>
        <p className="text-3xl sm:text-4xl font-bold mt-2">{formatPrice(balance)}</p>
        <p className="text-white/70 text-xs mt-2">Earn cashback on every delivered order.</p>
      </div>

      {/* History */}
      <h2 className="text-sm font-bold text-stone-900 mt-6 mb-3">Recent activity</h2>
      {!transactions.length ? (
        <EmptyState
          icon="💳"
          title="No transactions yet"
          description="Cashback and credits will show up here."
        />
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const meta = REASON_META[tx.reason] || REASON_META.adjustment;
            const isCredit = tx.type === "credit";
            const { Icon } = meta;
            return (
              <div key={tx._id} className="flex items-center gap-3 bg-white border border-stone-200/80 rounded-xl p-3 shadow-soft">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>
                  {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900">{meta.label}</p>
                  {tx.description && <p className="text-xs text-stone-400 truncate">{tx.description}</p>}
                  <p className="text-[10px] text-stone-400">{formatDate(tx.createdAt)}</p>
                </div>
                <span className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-stone-700"}`}>
                  {isCredit ? "+" : "−"}{formatPrice(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Wallet;
