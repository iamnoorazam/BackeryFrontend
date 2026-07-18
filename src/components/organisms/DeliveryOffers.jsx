import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Package, MapPin, IndianRupee, Check, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeliveryTripCard from "@/components/molecules/DeliveryTripCard";
import { useMyOffers, useMyAssignments, useAcceptOffer, useRejectOffer } from "@/hooks/useDispatch";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";
import { formatPrice } from "@/lib/utils";

// Display-only fallback TTL for the countdown when we only have offeredAt from
// the REST list. The server is authoritative — an expired accept returns 409.
const OFFER_TTL_SECONDS = 30;

const DeliveryOffers = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: offers } = useMyOffers();
  const { data: assignments } = useMyAssignments();
  const accept = useAcceptOffer();
  const reject = useRejectOffer();
  const [nowTs, setNowTs] = useState(() => Date.now());

  // Live: refresh offers/assignments as the dispatch engine emits events.
  useEffect(() => {
    if (!user?.id) return;
    connectSocket(user.id);
    const s = getSocket();
    const refreshOffers = () => qc.invalidateQueries({ queryKey: ["dispatch-offers"] });
    const onOffer = () => {
      refreshOffers();
      toast({ title: "New delivery request!", description: "Tap to accept before it expires." });
    };
    const onAssigned = () => {
      qc.invalidateQueries({ queryKey: ["dispatch-offers"] });
      qc.invalidateQueries({ queryKey: ["dispatch-assignments"] });
    };
    s.on("order_offer", onOffer);
    s.on("order_offer_expired", refreshOffers);
    s.on("order_assigned", onAssigned);
    return () => {
      s.off("order_offer", onOffer);
      s.off("order_offer_expired", refreshOffers);
      s.off("order_assigned", onAssigned);
      disconnectSocket();
    };
  }, [user?.id, qc, toast]);

  // Tick every second to drive the countdown + auto-refresh when an offer lapses.
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const offer = offers?.[0];
  const secondsLeft = offer?.assignment?.offeredAt
    ? Math.max(
        0,
        OFFER_TTL_SECONDS -
          Math.floor((nowTs - new Date(offer.assignment.offeredAt).getTime()) / 1000),
      )
    : 0;

  useEffect(() => {
    if (offer && secondsLeft === 0) qc.invalidateQueries({ queryKey: ["dispatch-offers"] });
  }, [offer, secondsLeft, qc]);

  const onAccept = (id) =>
    accept.mutate(id, {
      onSuccess: () => toast({ title: "Order accepted — head to pickup" }),
      onError: (err) =>
        toast({
          title: err.response?.data?.message || "Offer no longer available",
          variant: "destructive",
        }),
    });

  const onReject = (id) => reject.mutate(id);

  return (
    <div className="space-y-4">
      {/* Incoming offer */}
      {offer && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 space-y-3 animate-pulse-once">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
              <Package className="h-4 w-4" /> New delivery request
            </span>
            <span className="text-xs font-bold text-white bg-emerald-600 rounded-full px-2.5 py-1 tabular-nums">
              {secondsLeft}s
            </span>
          </div>
          <div className="text-sm text-stone-700 space-y-1">
            <p className="flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-emerald-600" /> Pickup:{" "}
              <span className="font-semibold">{offer.vendor?.name || "Store"}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-stone-500" /> Drop:{" "}
              {offer.deliveryAddress?.city || "—"}
            </p>
            <p className="flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-stone-500" /> Order{" "}
              {formatPrice(offer.totalPrice)} ·{" "}
              {offer.paymentMethod === "cod" ? "Collect cash" : "Prepaid"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onReject(offer._id)}
              disabled={reject.isPending}
              variant="outline"
              className="rounded-xl border-2 border-stone-300 font-semibold text-stone-600"
            >
              <X className="h-4 w-4 mr-1" /> Decline
            </Button>
            <Button
              onClick={() => onAccept(offer._id)}
              disabled={accept.isPending || secondsLeft === 0}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Check className="h-4 w-4 mr-1" /> Accept
            </Button>
          </div>
        </div>
      )}

      {/* Active deliveries — interactive trip cards (D4) */}
      {!!assignments?.length && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
            Active deliveries ({assignments.length})
          </h2>
          {assignments.map((a) => (
            <DeliveryTripCard key={a._id} order={a} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryOffers;
