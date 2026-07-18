import { useState } from "react";
import { Search, TrendingUp, SearchX, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useSearchAnalytics } from "@/hooks/useSearch";

const Stat = ({ label, value, tone = "" }) => (
  <Card>
    <CardContent className="p-3">
      <p className="text-xs text-stone-400 uppercase">{label}</p>
      <p className={`text-xl font-bold ${tone}`}>{value}</p>
    </CardContent>
  </Card>
);

// A ranked list with a proportional bar per row (dependency-free, matches the
// CSS-bar convention used elsewhere in the admin dashboards).
const RankedList = ({ rows, max, barClass }) => (
  <div className="space-y-2">
    {rows.map((r) => (
      <div key={r.term} className="space-y-1">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="truncate">{r.term}</span>
          <span className="text-stone-400 shrink-0">
            {r.count}
            {r.avgResults != null ? ` · ~${r.avgResults} results` : ""}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${barClass}`}
            style={{ width: `${max ? Math.max(4, (r.count / max) * 100) : 0}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const AdminSearchInsights = () => {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useSearchAnalytics(days);

  const topMax = data?.topQueries?.[0]?.count || 0;
  const zeroMax = data?.zeroResultQueries?.[0]?.count || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Search className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold">Search Insights</h1>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !data ? (
        <EmptyState icon="🔍" title="No data" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Total searches" value={data.totalSearches} />
            <Stat label="Unique terms" value={data.uniqueTerms} />
            <Stat
              label="Zero-result rate"
              value={`${data.zeroResultRate}%`}
              tone={data.zeroResultRate > 20 ? "text-red-500" : "text-green-600"}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  <h2 className="font-semibold">Top queries</h2>
                </div>
                {!data.topQueries?.length ? (
                  <p className="text-sm text-stone-400">No searches in this window.</p>
                ) : (
                  <RankedList rows={data.topQueries} max={topMax} barClass="bg-teal-500" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <SearchX className="h-4 w-4 text-red-500" />
                  <h2 className="font-semibold">Zero-result queries</h2>
                  <span className="text-xs text-stone-400">(unmet demand)</span>
                </div>
                {!data.zeroResultQueries?.length ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Hash className="h-4 w-4" /> Every query returned results.
                  </div>
                ) : (
                  <RankedList rows={data.zeroResultQueries} max={zeroMax} barClass="bg-red-400" />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSearchInsights;
