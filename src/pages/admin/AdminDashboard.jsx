import StatCard from "@/components/molecules/StatCard";
import Spinner from "@/components/atoms/Spinner";
import { useAdminStats } from "@/hooks/useAdmin";
import { formatPrice } from "@/lib/utils";

const AdminDashboard = () => {
  const { data, isLoading } = useAdminStats();

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Platform Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={data?.totalUsers ?? 0} icon="👥" />
        <StatCard title="Total Orders" value={data?.totalOrders ?? 0} icon="📦" color="text-blue-600" />
        <StatCard title="Total Products" value={data?.totalProducts ?? 0} icon="🍰" color="text-purple-600" />
        <StatCard title="Total Revenue" value={formatPrice(data?.totalRevenue ?? 0)} icon="💰" color="text-green-600" />
      </div>
    </div>
  );
};

export default AdminDashboard;
