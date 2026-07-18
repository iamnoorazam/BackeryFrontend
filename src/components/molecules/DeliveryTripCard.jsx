import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  MapPin,
  Navigation,
  PackageCheck,
  KeyRound,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripAction } from "@/hooks/useDispatch";
import { chatApi } from "@/api/chat.api";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";

// The ordered trip stages a rider steps through, with the button that advances
// each one. `arrived_drop` is special-cased (needs an OTP), handled below.
const STAGE_STEP = {
  pending: { step: "arrived-pickup", label: "Arrived at store", Icon: Navigation },
  arrived_pickup: { step: "pickup", label: "Picked up order", Icon: PackageCheck },
  picked_up: { step: "arrived-drop", label: "Reached customer", Icon: MapPin },
};

const STAGE_LABEL = {
  pending: "Head to the store",
  arrived_pickup: "At the store — collect the order",
  picked_up: "On the way to the customer",
  arrived_drop: "Ask the customer for their OTP",
  failed: "Delivery failed",
};

const DeliveryTripCard = ({ order }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const trip = useTripAction();
  const [otp, setOtp] = useState("");
  const stage = order.assignment?.stage || "pending";

  const messageCustomer = async () => {
    const customerId = order.customer?._id;
    if (!customerId) return;
    try {
      await chatApi.start(customerId);
      navigate("/delivery/chat");
    } catch {
      toast({ title: "Could not open chat", variant: "destructive" });
    }
  };

  const run = (step, body, successTitle) =>
    trip.mutate(
      { orderId: order._id, step, body },
      {
        onSuccess: () => {
          if (step === "verify-otp") setOtp("");
          toast({ title: successTitle });
        },
        onError: (err) =>
          toast({
            title: err.response?.data?.message || "Action failed",
            variant: "destructive",
          }),
      },
    );

  const advance = STAGE_STEP[stage];

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm flex items-center gap-1.5 truncate">
            <Store className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />
            {order.vendor?.name || "Store"}
          </p>
          <p className="text-xs text-stone-500 truncate mt-0.5">
            → {order.deliveryAddress?.city || "—"} · {order.customer?.name || "Customer"}
            {order.customer?.phone ? ` · ${order.customer.phone}` : ""}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">{STAGE_LABEL[stage]}</p>
          {order.customer?._id && stage !== "delivered" && stage !== "failed" && (
            <button
              onClick={messageCustomer}
              className="text-[11px] text-[#0F766E] font-medium flex items-center gap-1 mt-1"
            >
              <MessageSquare className="h-3 w-3" /> Message customer
            </button>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold">{formatPrice(order.totalPrice)}</p>
          <p className="text-[10px] text-stone-400">
            {order.paymentMethod === "cod" ? "Collect cash" : "Prepaid"}
          </p>
        </div>
      </div>

      {stage === "failed" ? (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />{" "}
          {order.assignment?.failureReason || "Delivery failed"}
        </div>
      ) : stage === "arrived_drop" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                className="pl-9 h-11 rounded-xl"
              />
            </div>
            <Button
              onClick={() => run("verify-otp", { otp }, "Delivered! Nice work.")}
              disabled={trip.isPending || otp.length !== 6}
              className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Complete
            </Button>
          </div>
        </div>
      ) : (
        advance && (
          <Button
            onClick={() => run(advance.step, undefined, `${advance.label} ✓`)}
            disabled={trip.isPending}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] text-white font-bold"
          >
            <advance.Icon className="h-4 w-4 mr-2" /> {advance.label}
          </Button>
        )
      )}

      {stage !== "failed" && stage !== "arrived_drop" && (
        <button
          onClick={() => {
            const reason = window.prompt("What went wrong? (shown to the store)");
            if (reason && reason.trim()) run("fail", { reason: reason.trim() }, "Reported");
          }}
          className="w-full text-[11px] text-stone-400 hover:text-red-500"
        >
          Report a problem
        </button>
      )}
    </div>
  );
};

export default DeliveryTripCard;
