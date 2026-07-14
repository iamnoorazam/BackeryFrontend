import { MapPin, Truck, Clock, Ban, Loader2 } from "lucide-react";

const MAX_DELIVERY_RADIUS_KM = 20;

const DeliveryInfo = ({ delivery, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 text-orange-500 animate-spin shrink-0" />
        <p className="text-sm text-stone-500">Calculating delivery information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!delivery) return null;

  if (!delivery.isDeliverable) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm sm:text-base">Delivery not available</p>
            <p className="text-xs sm:text-sm text-red-600 mt-1">
              Sorry, we currently do not deliver to your location.
            </p>
            {delivery.distanceKm && (
              <p className="text-xs text-red-500 mt-1">
                Your location is {delivery.distanceKm} km away (max {MAX_DELIVERY_RADIUS_KM} km).
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-green-800">
          📍 Distance from our main office: {delivery.distanceKm} km
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-green-800">
          🚚 Estimated delivery time: {delivery.estimatedTime}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Truck className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-green-800">
          Delivery charge: ₹{delivery.charge}
          {delivery.distanceKm > 0 && (
            <span className="text-xs text-green-500 ml-1">
              ({delivery.distanceKm <= 2 ? "≤ 2 km" : delivery.distanceKm <= 5 ? "2-5 km" : delivery.distanceKm <= 10 ? "5-10 km" : delivery.distanceKm <= 15 ? "10-15 km" : "15+ km"})
            </span>
          )}
        </span>
      </div>
      {delivery.fastCharge && (
        <div className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-amber-800">
            ⚡ Fast delivery available: ₹{delivery.fastCharge} ({delivery.fastEstimatedTime})
          </span>
        </div>
      )}
    </div>
  );
};

export default DeliveryInfo;
