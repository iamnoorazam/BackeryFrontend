import { Bike, Phone, Star } from "lucide-react";
import LiveTrackingMap from "@/components/organisms/LiveTrackingMap";
import { useOrderTracking } from "@/hooks/useDispatch";

const STAGE_LABEL = {
  pending: "Rider heading to the store",
  arrived_pickup: "Rider is picking up your order",
  picked_up: "On the way to you",
  arrived_drop: "Rider has arrived — share your OTP",
  delivered: "Delivered",
  failed: "Delivery issue — the store will follow up",
};

/**
 * Customer live-tracking panel (Phase 4, D5). Shows the assigned rider, the
 * trip stage, and a live map with the rider's moving marker. Rendered only for
 * active orders that already have a rider.
 */
const LiveTracking = ({ order }) => {
  const { data, isLoading } = useOrderTracking(order._id);

  if (isLoading || !data?.hasRider) return null;

  const { rider, pickup, drop, stage } = data;

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
          <Bike className="h-4 w-4" /> {STAGE_LABEL[stage] || "Live tracking"}
        </p>
        {rider?.name && (
          <div className="text-right">
            <p className="text-xs font-semibold text-stone-700">{rider.name}</p>
            <div className="flex items-center justify-end gap-2 text-[10px] text-stone-500">
              {rider.vehicle && <span className="capitalize">{rider.vehicle}</span>}
              {rider.rating > 0 && (
                <span className="flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />{" "}
                  {rider.rating.toFixed(1)}
                </span>
              )}
              {rider.phone && (
                <a
                  href={`tel:${rider.phone}`}
                  className="flex items-center gap-0.5 text-emerald-700"
                >
                  <Phone className="h-2.5 w-2.5" /> Call
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <LiveTrackingMap
        orderId={order._id}
        pickup={pickup}
        drop={drop}
        initialRider={rider?.location}
      />
    </div>
  );
};

export default LiveTracking;
