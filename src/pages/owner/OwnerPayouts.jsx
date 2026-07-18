import { useState } from "react";
import { Wallet, IndianRupee, TrendingDown, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useEarnings, useMyPayouts, useRequestPayout } from "@/hooks/usePayouts";
import { useToast } from "@/store/Toast";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_CLS = {
  requested: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const OwnerPayouts = () => {
  const { data: earnings, isLoading } = useEarnings();
  const { data: payouts } = useMyPayouts();
  const request = useRequestPayout();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt < 1) return;
    request.mutate(amt, {
      onSuccess: () => {
        toast({ title: "Payout requested" });
        setAmount("");
      },
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Request failed", variant: "destructive" }),
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold">Earnings & payouts</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={IndianRupee}
          label="Gross sales"
          value={formatPrice(earnings?.grossSales || 0)}
        />
        <Stat
          icon={TrendingDown}
          label={`Commission (${Math.round((earnings?.commissionRate || 0) * 100)}%)`}
          value={formatPrice(earnings?.commission || 0)}
        />
        <Stat
          icon={Banknote}
          label="Net earnings"
          value={formatPrice(earnings?.netEarnings || 0)}
        />
        <Stat
          icon={Wallet}
          label="Available"
          value={formatPrice(earnings?.available || 0)}
          highlight
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-3">
            Request a payout
          </h2>
          <form onSubmit={submit} className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Up to ${earnings?.available || 0}`}
              className="max-w-xs"
            />
            <Button
              type="submit"
              disabled={request.isPending || !(earnings?.available > 0)}
              className="bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white font-bold"
            >
              {request.isPending ? "…" : "Withdraw"}
            </Button>
          </form>
          {earnings?.pendingPayouts > 0 && (
            <p className="text-xs text-stone-500 mt-2">
              {formatPrice(earnings.pendingPayouts)} pending · {formatPrice(earnings.paidOut)} paid
              out
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-2">History</h2>
        {!payouts?.length ? (
          <EmptyState icon="💸" title="No payout requests yet" />
        ) : (
          <div className="space-y-2">
            {payouts.map((p) => (
              <Card key={p._id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold">{formatPrice(p.amount)}</p>
                    <p className="text-xs text-stone-500">
                      {formatDate(p.createdAt)}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CLS[p.status]}`}
                  >
                    {p.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, highlight }) => (
  <div
    className={`rounded-2xl border p-4 ${highlight ? "bg-[#FFF7ED] border-[#E8A04F]" : "bg-white border-stone-200"}`}
  >
    <Icon className={`h-5 w-5 ${highlight ? "text-[#D2691E]" : "text-stone-400"}`} />
    <p className="text-xl font-bold mt-1 text-stone-900">{value}</p>
    <p className="text-xs text-stone-500">{label}</p>
  </div>
);

export default OwnerPayouts;
