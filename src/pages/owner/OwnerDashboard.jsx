import StatCard from "@/components/molecules/StatCard";
import Spinner from "@/components/atoms/Spinner";
import { useOwnerDashboard } from "@/hooks/useOwner";
import { useIssueStats } from "@/hooks/useIssues";
import { formatPrice } from "@/lib/utils";
import { Link } from "react-router-dom";

const OwnerDashboard = () => {
  const { data, isLoading } = useOwnerDashboard();
  const { data: issueStats } = useIssueStats();

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={data?.totalOrders ?? 0} icon="📦" />
        <StatCard title="Today's Orders" value={data?.todayOrders ?? 0} icon="🛒" color="text-blue-600" />
        <StatCard title="Total Products" value={data?.totalProducts ?? 0} icon="🍰" color="text-purple-600" />
        <StatCard title="Revenue" value={formatPrice(data?.totalRevenue ?? 0)} icon="💰" color="text-green-600" />
      </div>

      {issueStats && issueStats.open > 0 && (
        <Link
          to="/owner/issues"
          className="block p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="text-lg">⚠️</span>
            </div>
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
    </div>
  );
};

export default OwnerDashboard;
