import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Bike,
  LogOut,
  Power,
  Coffee,
  PauseCircle,
  Star,
  Package,
  MapPin,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DeliveryOffers from "@/components/organisms/DeliveryOffers";
import SafetyControls from "@/components/molecules/SafetyControls";
import {
  useMyPartnerProfile,
  useSetAvailability,
  useUpdateLocation,
} from "@/hooks/useDeliveryPartner";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";

const STATUS_META = {
  offline: { label: "Offline", dot: "bg-stone-400", cls: "bg-stone-100 text-stone-600" },
  online: { label: "Online", dot: "bg-emerald-500", cls: "bg-emerald-100 text-emerald-700" },
  busy: { label: "On a delivery", dot: "bg-amber-500", cls: "bg-amber-100 text-amber-700" },
  break: { label: "On break", dot: "bg-sky-500", cls: "bg-sky-100 text-sky-700" },
};

// Throttle live-location pings so watchPosition doesn't spam the API.
const LOCATION_MIN_INTERVAL_MS = 15000;

const DeliveryDashboard = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const { data: partner, isLoading } = useMyPartnerProfile();
  const setAvailability = useSetAvailability();
  const updateLocation = useUpdateLocation();

  // Keep the latest mutate fn in a ref so the geolocation watcher effect only
  // re-subscribes when the online/offline state changes, not every render.
  const sendLocationRef = useRef(updateLocation.mutate);
  useEffect(() => {
    sendLocationRef.current = updateLocation.mutate;
  });

  const status = partner?.availabilityStatus || "offline";
  const isOnline = status !== "offline";
  const approved = partner?.verificationStatus === "approved";

  // Stream location to the server while the rider is not offline.
  useEffect(() => {
    if (!isOnline || !approved) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    let lastSent = 0;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSent < LOCATION_MIN_INTERVAL_MS) return;
        lastSent = now;
        sendLocationRef.current({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        /* permission denied / unavailable — silent, rider still shows online */
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, approved]);

  const changeStatus = (next) =>
    setAvailability.mutate(next, {
      onError: (err) =>
        toast({
          title: err.response?.data?.message || "Could not update status",
          variant: "destructive",
        }),
    });

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
      </div>
    );
  }

  const meta = STATUS_META[status] || STATUS_META.offline;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#2DD4BF] grid place-items-center shadow-lg shadow-[#0F766E]/20">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 leading-tight">{partner?.name}</h1>
              <p className="text-xs text-stone-500">Delivery dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/delivery/performance"
              className="text-stone-500 hover:text-[#0F766E] flex items-center gap-1 text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4" /> Stats
            </Link>
            <Link
              to="/delivery/earnings"
              className="text-stone-500 hover:text-[#0F766E] flex items-center gap-1 text-sm font-medium"
            >
              <Wallet className="h-4 w-4" /> Earnings
            </Link>
            <Link
              to="/delivery/settings"
              className="text-stone-500 hover:text-[#0F766E] flex items-center gap-1 text-sm font-medium"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button
              onClick={logout}
              className="text-stone-400 hover:text-red-500 flex items-center gap-1 text-sm"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {!approved ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center space-y-3">
            <MapPin className="h-10 w-10 text-amber-500 mx-auto" />
            <p className="text-stone-700 font-semibold">
              Your account isn&apos;t active yet ({partner?.verificationStatus}).
            </p>
            <Link to="/delivery/onboarding">
              <Button className="rounded-xl bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] text-white font-bold">
                Go to onboarding / status
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Status card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${meta.cls}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${meta.dot} ${isOnline ? "animate-pulse" : ""}`}
                  />
                  {meta.label}
                </div>
                {partner?.lastLocationAt && (
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> location live
                  </span>
                )}
              </div>

              {!isOnline ? (
                <Button
                  onClick={() => changeStatus("online")}
                  disabled={setAvailability.isPending}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold"
                >
                  <Power className="h-4 w-4 mr-2" /> Go online
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => changeStatus("offline")}
                    disabled={setAvailability.isPending}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-stone-200 font-bold text-stone-700"
                  >
                    <Power className="h-4 w-4 mr-2" /> Go offline
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => changeStatus(status === "break" ? "online" : "break")}
                      disabled={setAvailability.isPending}
                      variant="outline"
                      className={`h-11 rounded-xl border-2 font-semibold ${status === "break" ? "border-sky-400 text-sky-600 bg-sky-50" : "border-stone-200 text-stone-600"}`}
                    >
                      <Coffee className="h-4 w-4 mr-2" /> {status === "break" ? "Resume" : "Break"}
                    </Button>
                    <Button
                      onClick={() => changeStatus(status === "busy" ? "online" : "busy")}
                      disabled={setAvailability.isPending}
                      variant="outline"
                      className={`h-11 rounded-xl border-2 font-semibold ${status === "busy" ? "border-amber-400 text-amber-600 bg-amber-50" : "border-stone-200 text-stone-600"}`}
                    >
                      <PauseCircle className="h-4 w-4 mr-2" />{" "}
                      {status === "busy" ? "Free up" : "Busy"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-stone-400 text-center">
                    Allow location access so orders can be assigned to you nearby.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Live order offers + active assignments (D3) */}
            <DeliveryOffers />

            {/* Emergency SOS + incident reporting (D9) */}
            <SafetyControls />

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <Stat
                icon={Star}
                label="Rating"
                value={partner?.rating ? partner.rating.toFixed(1) : "—"}
              />
              <Stat icon={Package} label="Deliveries" value={partner?.totalDeliveries ?? 0} />
              <Stat icon={Bike} label="Vehicle" value={partner?.vehicle?.type || "—"} />
            </div>

            <p className="text-xs text-stone-400 text-center">
              Live pickup &amp; delivery navigation arrives in the next module.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl bg-white border border-stone-200 p-4 text-center">
    <Icon className="h-4 w-4 text-[#0F766E] mx-auto mb-1" />
    <p className="text-lg font-bold text-stone-900 capitalize">{value}</p>
    <p className="text-[11px] text-stone-400">{label}</p>
  </div>
);

export default DeliveryDashboard;
