import { useState } from "react";
import { Download, TrendingUp, ShoppingBag, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useSalesSummary, useSalesSeries, useTopProducts } from "@/hooks/useAnalytics";
import { analyticsApi } from "@/api/analytics.api";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";

const PERIODS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
];

const OwnerAnalytics = () => {
  const [period, setPeriod] = useState("30d");
  const { toast } = useToast();
  const { data: summary, isLoading: sLoading } = useSalesSummary(period);
  const { data: series } = useSalesSeries(period);
  const { data: top } = useTopProducts(period);
  const [downloading, setDownloading] = useState(false);

  const downloadCsv = async () => {
    setDownloading(true);
    try {
      const res = await analyticsApi.ordersCsv(period);
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  if (sLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  const maxRev = Math.max(1, ...(series || []).map((p) => p.revenue));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  period === p.value ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCsv}
            disabled={downloading}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" /> {downloading ? "…" : "CSV"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat icon={IndianRupee} label="Revenue" value={formatPrice(summary?.revenue || 0)} />
        <Stat icon={ShoppingBag} label="Orders" value={summary?.orders || 0} />
        <Stat
          icon={TrendingUp}
          label="Avg order value"
          value={formatPrice(summary?.avgOrderValue || 0)}
        />
      </div>

      {/* Sales chart (dependency-free CSS bars) */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-4">
          Revenue over time
        </h2>
        {!series?.length ? (
          <p className="text-sm text-stone-400 py-6 text-center">No sales in this period.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {series.map((p) => (
              <div
                key={p.date}
                className="flex-1 flex flex-col items-center justify-end group"
                title={`${p.date}: ${formatPrice(p.revenue)} (${p.orders} orders)`}
              >
                <div
                  className="w-full rounded-t bg-gradient-to-t from-[#D2691E] to-[#E8A04F] min-h-[2px] group-hover:opacity-80 transition-opacity"
                  style={{ height: `${(p.revenue / maxRev) * 100}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-3">
          Top selling
        </h2>
        {!top?.length ? (
          <EmptyState icon="📊" title="No sales yet" />
        ) : (
          <div className="space-y-2">
            {top.map((p, i) => (
              <div key={p._id || i} className="flex items-center gap-3">
                <span className="text-sm font-bold text-stone-400 w-5">{i + 1}</span>
                {p.image ? (
                  <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-stone-100" />
                )}
                <span className="flex-1 min-w-0 truncate text-sm font-medium">{p.name}</span>
                <span className="text-xs text-stone-500 shrink-0">{p.qty} sold</span>
                <span className="text-sm font-bold text-stone-800 shrink-0 w-20 text-right">
                  {formatPrice(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl bg-white border border-stone-200 p-4">
    <Icon className="h-5 w-5 text-[#D2691E]" />
    <p className="text-2xl font-bold mt-1 text-stone-900">{value}</p>
    <p className="text-xs text-stone-500">{label}</p>
  </div>
);

export default OwnerAnalytics;
