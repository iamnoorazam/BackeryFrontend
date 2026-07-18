import { useState } from "react";
import { Wallet, RefreshCw, CheckCircle, XCircle, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import {
  useFinanceOverview,
  useLedger,
  useRefunds,
  useActOnRefund,
  useFailedPayments,
  useRetryPayment,
} from "@/hooks/useFinance";
import { useToast } from "../../store/Toast";
import { formatPrice, formatDate } from "@/lib/utils";

const Kpi = ({ label, value, tone = "text-stone-800", hint }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className={`text-xl font-bold mt-1 ${tone}`}>{value}</p>
      {hint && <p className="text-xs text-stone-400 mt-0.5">{hint}</p>}
    </CardContent>
  </Card>
);

const TABS = ["Overview", "Refunds", "Failed Payments", "Ledger"];

const AdminFinance = () => {
  const [tab, setTab] = useState("Overview");
  const { toast } = useToast();

  const { data: overview, isLoading: loadingOverview } = useFinanceOverview();
  const { data: refunds } = useRefunds();
  const { data: failed } = useFailedPayments();
  const { data: ledger } = useLedger(50);
  const actOnRefund = useActOnRefund();
  const retryPayment = useRetryPayment();

  const refundAct = (id, action) =>
    actOnRefund.mutate(
      { id, action },
      {
        onSuccess: () => toast({ title: `Refund ${action}` }),
        onError: (e) =>
          toast({ title: e?.response?.data?.message || "Action failed", variant: "destructive" }),
      },
    );

  const retry = (id) =>
    retryPayment.mutate(id, {
      onSuccess: () => toast({ title: "Payment reset for retry" }),
      onError: () => toast({ title: "Retry failed", variant: "destructive" }),
    });

  const refundTone = {
    requested: "secondary",
    approved: "default",
    processed: "default",
    rejected: "destructive",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Finance</h1>
      </div>

      <div className="flex gap-1 border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
        {TABS.map((t) => {
          const count =
            t === "Refunds" ? refunds?.length : t === "Failed Payments" ? failed?.length : null;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {t}
              {count > 0 && <span className="ml-1 text-xs">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {tab === "Overview" &&
        (loadingOverview ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Kpi
                label="GMV"
                value={formatPrice(overview?.gmv ?? 0)}
                hint={`${overview?.totalOrders ?? 0} orders`}
              />
              <Kpi
                label="Realized Revenue"
                value={formatPrice(overview?.realizedRevenue ?? 0)}
                tone="text-green-600"
                hint={`${overview?.deliveredOrders ?? 0} delivered`}
              />
              <Kpi
                label="Commission"
                value={formatPrice(overview?.commission ?? 0)}
                tone="text-teal-600"
                hint={`${Math.round((overview?.commissionRate ?? 0) * 100)}% rate`}
              />
              <Kpi
                label="Net Platform"
                value={formatPrice(overview?.netPlatform ?? 0)}
                tone="text-indigo-600"
                hint="commission − refunds"
              />
              <Kpi
                label="COD Collected"
                value={formatPrice(overview?.cod?.collected ?? 0)}
                tone="text-amber-600"
              />
              <Kpi label="Online Collected" value={formatPrice(overview?.online?.collected ?? 0)} />
              <Kpi
                label="Refunds Processed"
                value={formatPrice(overview?.refundsProcessed ?? 0)}
                tone="text-red-500"
              />
              <Kpi
                label="Payouts Pending"
                value={formatPrice(overview?.payouts?.totalPending ?? 0)}
                tone="text-orange-500"
                hint={`${formatPrice(overview?.payouts?.totalPaid ?? 0)} paid`}
              />
            </div>
          </div>
        ))}

      {/* Refunds */}
      {tab === "Refunds" &&
        (!refunds?.length ? (
          <EmptyState icon="↩️" title="No refunds" />
        ) : (
          <div className="space-y-2">
            {refunds.map((r) => (
              <Card key={r._id}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{formatPrice(r.amount)}</span>
                      <Badge variant={refundTone[r.status] || "secondary"}>{r.status}</Badge>
                      <Badge variant="outline">{r.method}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.reason}</p>
                    <p className="text-xs text-stone-400">
                      {r.customer?.name || "customer"} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  {(r.status === "requested" || r.status === "approved") && (
                    <div className="flex gap-2 shrink-0">
                      {r.status === "requested" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => refundAct(r._id, "approve")}
                        >
                          Approve
                        </Button>
                      )}
                      <Button size="sm" onClick={() => refundAct(r._id, "process")}>
                        <Wallet className="h-4 w-4 mr-1" /> Process
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => refundAct(r._id, "reject")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {r.status === "processed" && (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

      {/* Failed payments */}
      {tab === "Failed Payments" &&
        (!failed?.length ? (
          <EmptyState icon="✅" title="No failed payments" />
        ) : (
          <div className="space-y-2">
            {failed.map((f) => (
              <Card key={f._id}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatPrice(f.totalPrice)}</span>
                      <Badge variant="outline">{f.paymentMethod}</Badge>
                      <Badge variant="secondary" className="capitalize">
                        {f.orderStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-400">
                      {f.customerName || "customer"} · {formatDate(f.createdAt)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => retry(f._id)}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Retry
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

      {/* Ledger */}
      {tab === "Ledger" &&
        (!ledger?.length ? (
          <EmptyState icon="📒" title="No ledger entries" />
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-stone-100 dark:divide-stone-800">
              {ledger.map((e, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Receipt className="h-4 w-4 text-stone-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium capitalize">{e.kind.replace(/_/g, " ")}</p>
                      <p className="text-xs text-stone-400 truncate">{e.detail}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-semibold ${e.direction === "in" ? "text-green-600" : "text-red-500"}`}
                    >
                      {e.direction === "in" ? "+" : "−"}
                      {formatPrice(e.amount)}
                    </p>
                    <p className="text-[11px] text-stone-400">{formatDate(e.at)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default AdminFinance;
