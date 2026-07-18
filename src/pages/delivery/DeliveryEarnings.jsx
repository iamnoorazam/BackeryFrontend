import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  IndianRupee,
  Banknote,
  CalendarDays,
  ArrowLeft,
  Bike,
  Package,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import {
  useRiderEarnings,
  useMyRiderPayouts,
  useRequestRiderPayout,
} from "@/hooks/useRiderEarnings";
import { useActiveIncentives } from "@/hooks/useDeliveryConfig";
import { useToast } from "@/store/Toast";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_CLS = {
  requested: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const DeliveryEarnings = () => {
  const { data: earnings, isLoading } = useRiderEarnings();
  const { data: payouts } = useMyRiderPayouts();
  const { data: activeIncentives } = useActiveIncentives();
  const request = useRequestRiderPayout();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");

  const submit = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt < 1) return;
    request.mutate(
      { amount: amt, method },
      {
        onSuccess: () => {
          toast({ title: "Payout requested" });
          setAmount("");
        },
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Request failed", variant: "destructive" }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner />
      </div>
    );
  }

  const t = earnings?.totals || {};

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/delivery/dashboard" className="text-stone-400 hover:text-stone-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-stone-900">Earnings & payouts</h1>
        </div>

        {/* Period totals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={CalendarDays} label="Today" value={formatPrice(t.today || 0)} />
          <Stat icon={CalendarDays} label="This week" value={formatPrice(t.week || 0)} />
          <Stat icon={CalendarDays} label="This month" value={formatPrice(t.month || 0)} />
          <Stat
            icon={Wallet}
            label="Available"
            value={formatPrice(earnings?.available || 0)}
            highlight
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Package} label="Deliveries" value={earnings?.deliveredCount ?? 0} />
          <Stat icon={IndianRupee} label="Total earned" value={formatPrice(t.total || 0)} />
          <Stat icon={Gift} label="Bonuses" value={formatPrice(earnings?.bonuses || 0)} />
          <Stat
            icon={Banknote}
            label="Cash to settle"
            value={formatPrice(earnings?.codCollected || 0)}
          />
        </div>

        {!!activeIncentives?.length && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <p className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
              <Gift className="h-4 w-4" /> Active bonuses
            </p>
            {activeIncentives.map((i) => (
              <div key={i._id} className="flex items-center justify-between text-xs text-stone-600">
                <span className="truncate">
                  {i.title} <span className="text-stone-400">· {i.city || "all cities"}</span>
                </span>
                <span className="font-bold text-emerald-700 shrink-0">
                  +{formatPrice(i.perDeliveryBonus)}/delivery
                </span>
              </div>
            ))}
          </div>
        )}

        {earnings?.codCollected > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            You&apos;ve collected {formatPrice(earnings.codCollected)} in cash (COD) owed to the
            platform — it&apos;s settled against your account.
          </p>
        )}

        {/* Request payout */}
        <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
            Withdraw earnings
          </h2>
          <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Up to ${earnings?.available || 0}`}
              className="max-w-[10rem]"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-10 rounded-xl border-2 border-stone-200 bg-white px-3 text-sm"
            >
              <option value="upi">UPI</option>
              <option value="bank">Bank transfer</option>
            </select>
            <Button
              type="submit"
              disabled={request.isPending || !(earnings?.available > 0)}
              className="bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] text-white font-bold"
            >
              {request.isPending ? "…" : "Withdraw"}
            </Button>
          </form>
          {earnings?.pendingPayouts > 0 && (
            <p className="text-xs text-stone-500">
              {formatPrice(earnings.pendingPayouts)} pending · {formatPrice(earnings.paidOut)} paid
              out
            </p>
          )}
        </div>

        {/* Payout history */}
        <div>
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-2">
            Payout history
          </h2>
          {!payouts?.length ? (
            <EmptyState icon="💸" title="No payout requests yet" />
          ) : (
            <div className="space-y-2">
              {payouts.map((p) => (
                <div
                  key={p._id}
                  className="rounded-2xl bg-white border border-stone-200 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold">{formatPrice(p.amount)}</p>
                    <p className="text-xs text-stone-500 capitalize">
                      {p.method} · {formatDate(p.createdAt)}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CLS[p.status]}`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent deliveries */}
        <div>
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-2">
            Recent deliveries
          </h2>
          {!earnings?.transactions?.length ? (
            <EmptyState icon="🛵" title="No deliveries yet" />
          ) : (
            <div className="space-y-2">
              {earnings.transactions.slice(0, 20).map((tx) => (
                <div
                  key={tx.orderId}
                  className="rounded-2xl bg-white border border-stone-200 p-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-1.5 truncate">
                      <Bike className="h-3.5 w-3.5 text-[#0F766E] shrink-0" /> {tx.vendorName}
                    </p>
                    <p className="text-xs text-stone-500">
                      {tx.distanceKm} km · {formatDate(tx.deliveredAt)}
                      {tx.codAmount > 0 ? ` · COD ${formatPrice(tx.codAmount)}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">+{formatPrice(tx.earning)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, highlight }) => (
  <div
    className={`rounded-2xl border p-4 ${highlight ? "bg-emerald-50 border-emerald-300" : "bg-white border-stone-200"}`}
  >
    <Icon className={`h-5 w-5 ${highlight ? "text-emerald-600" : "text-stone-400"}`} />
    <p className="text-lg font-bold mt-1 text-stone-900">{value}</p>
    <p className="text-xs text-stone-500">{label}</p>
  </div>
);

export default DeliveryEarnings;
