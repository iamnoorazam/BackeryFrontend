import { Link } from "react-router-dom";
import Spinner from "@/components/atoms/Spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommandCenter } from "@/hooks/useAdmin";
import { useIssueStats } from "@/hooks/useIssues";
import { formatPrice, formatDate } from "@/lib/utils";

// A single KPI tile. `to` makes it a shortcut into the relevant console.
const Kpi = ({ label, value, icon, tone = "text-stone-800", to, hint }) => {
  const body = (
    <Card className="card-hover h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
          <span className="text-lg">{icon}</span>
        </div>
        <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
        {hint && <p className="text-xs text-stone-400 mt-0.5">{hint}</p>}
      </CardContent>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

const fmtUptime = (s = 0) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const AdminDashboard = () => {
  const { data, isLoading, isFetching } = useCommandCenter();
  const { data: issueStats } = useIssueStats();

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  const series = data?.salesSeries || [];
  const maxRev = Math.max(1, ...series.map((p) => p.revenue));
  const health = data?.health;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Command Center</h1>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          {isFetching && <Spinner className="h-3 w-3" />}
          <span className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${health?.db === "up" ? "bg-green-500" : "bg-red-500"}`}
            />
            {health?.db === "up" ? "Systems operational" : "Degraded"} · up{" "}
            {fmtUptime(health?.uptimeSeconds)}
          </span>
        </div>
      </div>

      {/* Live ops KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Kpi
          label="Today's Revenue"
          value={formatPrice(data?.today?.revenue ?? 0)}
          icon="💰"
          tone="text-green-600"
        />
        <Kpi
          label="Today's Orders"
          value={data?.today?.orders ?? 0}
          icon="📦"
          tone="text-blue-600"
          to="/admin/orders"
        />
        <Kpi
          label="Live Orders"
          value={data?.liveOrders ?? 0}
          icon="🛵"
          tone="text-amber-600"
          to="/admin/delivery-ops"
          hint="in flight now"
        />
        <Kpi
          label="Cancelled Today"
          value={data?.today?.cancelled ?? 0}
          icon="✖️"
          tone="text-red-500"
        />
        <Kpi
          label="Online Restaurants"
          value={data?.restaurants?.open ?? 0}
          icon="🏪"
          to="/admin/vendors"
          hint={`${data?.restaurants?.closed ?? 0} closed`}
        />
        <Kpi
          label="Online Riders"
          value={data?.riders?.online ?? 0}
          icon="🚴"
          to="/admin/delivery-ops"
          hint={`${data?.riders?.busy ?? 0} on a trip`}
        />
        <Kpi
          label="Active Customers"
          value={data?.customers?.active24h ?? 0}
          icon="👥"
          hint="last 24h"
        />
        <Kpi
          label="Failed Payments"
          value={data?.payments?.failedToday ?? 0}
          icon="⚠️"
          tone="text-red-500"
          hint="today"
        />
      </div>

      {/* Attention queues */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Kpi
          label="Refund Queue"
          value={data?.payments?.refundQueue ?? 0}
          icon="↩️"
          tone="text-purple-600"
          hint="paid & cancelled"
        />
        <Kpi
          label="Pending Merchants"
          value={data?.approvals?.vendors ?? 0}
          icon="🕓"
          to="/admin/vendors"
        />
        <Kpi
          label="Pending Riders"
          value={data?.approvals?.riders ?? 0}
          icon="🕓"
          to="/admin/delivery-partners"
        />
      </div>

      {issueStats && issueStats.open > 0 && (
        <Link
          to="/admin/issues"
          className="block p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold text-red-800 text-sm">
                {issueStats.open} open issue{issueStats.open > 1 ? "s" : ""} need attention
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {issueStats.inProgress} in progress · {issueStats.resolved} resolved
              </p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart (dependency-free CSS bars) */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-4">
              Revenue — last 7 days
            </h2>
            {!series.length ? (
              <p className="text-sm text-stone-400 py-6 text-center">No sales yet.</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {series.map((p) => (
                  <div
                    key={p.date}
                    className="flex-1 flex flex-col items-center justify-end group"
                    title={`${p.date}: ${formatPrice(p.revenue)} (${p.orders} orders)`}
                  >
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#0F766E] to-[#2DD4BF] min-h-[2px] group-hover:opacity-80 transition-opacity"
                      style={{ height: `${(p.revenue / maxRev) * 100}%` }}
                    />
                    <span className="text-[10px] text-stone-400 mt-1 truncate w-full text-center">
                      {p.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity from the audit trail */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
                Recent Activity
              </h2>
              <Link to="/admin/audit" className="text-xs text-teal-600 hover:underline">
                View all
              </Link>
            </div>
            {!data?.recentActivity?.length ? (
              <p className="text-sm text-stone-400 py-4 text-center">No activity yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {data.recentActivity.map((a) => (
                  <li key={a._id} className="flex items-start gap-2 text-sm">
                    <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                      {a.action}
                    </Badge>
                    <div className="min-w-0">
                      <p className="truncate text-stone-600">{a.actor}</p>
                      <p className="text-[11px] text-stone-400">{formatDate(a.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
