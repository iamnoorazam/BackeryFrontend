import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  XCircle,
  Timer,
  Star,
  Route,
  Clock,
  ThumbsUp,
} from "lucide-react";
import Spinner from "@/components/atoms/Spinner";
import { useMyPartnerAnalytics } from "@/hooks/useDeliveryPartner";

const fmtHrs = (mins) => {
  const m = Math.round(mins || 0);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
};

const DeliveryPerformance = () => {
  const { data, isLoading } = useMyPartnerAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner />
      </div>
    );
  }

  const a = data || {};

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/delivery/dashboard" className="text-stone-400 hover:text-stone-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-stone-900">Performance</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Stat icon={Package} label="Completed" value={a.completedDeliveries ?? 0} />
          <Stat
            icon={ThumbsUp}
            label="Acceptance rate"
            value={a.acceptanceRate == null ? "—" : `${a.acceptanceRate}%`}
            highlight
          />
          <Stat icon={XCircle} label="Failed / cancel" value={`${a.cancellationRate ?? 0}%`} />
          <Stat icon={Timer} label="Avg delivery" value={`${a.avgDeliveryMinutes ?? 0} min`} />
          <Stat icon={Route} label="Distance" value={`${a.distanceKm ?? 0} km`} />
          <Stat
            icon={Star}
            label="Rating"
            value={a.totalRatings > 0 ? `${a.rating?.toFixed(1)} (${a.totalRatings})` : "—"}
          />
        </div>

        {/* Offers breakdown */}
        <div className="rounded-2xl bg-white border border-stone-200 p-5">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-3">
            Dispatch offers
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Mini label="Received" value={a.offers?.received ?? 0} />
            <Mini label="Accepted" value={a.offers?.accepted ?? 0} cls="text-emerald-600" />
            <Mini label="Missed / declined" value={a.offers?.rejected ?? 0} cls="text-red-500" />
          </div>
        </div>

        {/* Shift summary */}
        <div className="rounded-2xl bg-white border border-stone-200 p-5">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Working hours
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Mini label="Today" value={fmtHrs(a.shift?.todayMinutes)} />
            <Mini label="This week" value={fmtHrs(a.shift?.weekMinutes)} />
            <Mini label="Shifts" value={a.shift?.totalShifts ?? 0} />
          </div>
          {a.shift?.onShift && (
            <p className="text-xs text-emerald-700 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Currently on shift
            </p>
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

const Mini = ({ label, value, cls = "text-stone-900" }) => (
  <div>
    <p className={`text-lg font-bold ${cls}`}>{value}</p>
    <p className="text-[11px] text-stone-400">{label}</p>
  </div>
);

export default DeliveryPerformance;
