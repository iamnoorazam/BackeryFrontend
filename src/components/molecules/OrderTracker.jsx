import { Check, ClipboardList, ChefHat, Bike, PackageCheck, XCircle } from "lucide-react";

/**
 * Customer-facing order status timeline (Phase 2, Module 6).
 *
 * Renders the 5 happy-path steps as a horizontal stepper, filled up to the
 * order's current status and stamped with the time each step was reached (from
 * `statusHistory`). `waiting_for_otp` is shown as part of the "On the way" step.
 * Cancelled orders render a compact cancelled bar instead of the stepper.
 */

const STEPS = [
  { key: "placed", label: "Placed", Icon: ClipboardList },
  { key: "accepted", label: "Accepted", Icon: Check },
  { key: "preparing", label: "Preparing", Icon: ChefHat },
  { key: "out_for_delivery", label: "On the way", Icon: Bike },
  { key: "delivered", label: "Delivered", Icon: PackageCheck },
];

// Map any order status onto a step index in STEPS.
const statusToIndex = (status) => {
  switch (status) {
    case "placed": return 0;
    case "accepted": return 1;
    case "preparing": return 2;
    case "out_for_delivery":
    case "waiting_for_otp": return 3;
    case "delivered": return 4;
    default: return 0;
  }
};

const formatTime = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });

const OrderTracker = ({ status, statusHistory = [] }) => {
  const historyAt = (key) => statusHistory.find((h) => h.status === key)?.at;

  if (status === "cancelled") {
    const at = historyAt("cancelled");
    return (
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-3 py-2.5">
        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
        <span className="text-xs font-semibold text-red-700">Order cancelled</span>
        {at && <span className="text-[10px] text-red-400 ml-auto">{formatTime(at)}</span>}
      </div>
    );
  }

  const currentIndex = statusToIndex(status);
  const arriving = status === "waiting_for_otp";

  return (
    <div className="mt-3">
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const reached = i <= currentIndex;
          const at = historyAt(step.key) || (step.key === "out_for_delivery" && historyAt("waiting_for_otp"));
          const { Icon } = step;
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line to the previous step */}
              {i > 0 && (
                <span
                  className={`absolute top-3.5 right-1/2 w-full h-0.5 ${i <= currentIndex ? "bg-emerald-500" : "bg-stone-200"}`}
                  aria-hidden
                />
              )}
              <div
                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                      ? "bg-white border-emerald-500 text-emerald-600"
                      : "bg-white border-stone-200 text-stone-300"
                } ${active ? "ring-4 ring-emerald-100" : ""}`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={`mt-1.5 text-[10px] text-center leading-tight ${reached ? "text-stone-700 font-medium" : "text-stone-300"}`}>
                {active && arriving && step.key === "out_for_delivery" ? "Arriving" : step.label}
              </span>
              {at && reached && <span className="text-[9px] text-stone-400 mt-0.5">{formatTime(at)}</span>}
            </div>
          );
        })}
      </div>
      {arriving && (
        <p className="mt-2 text-[11px] text-indigo-600 text-center">
          Your order has arrived — share your delivery OTP with the partner to confirm.
        </p>
      )}
    </div>
  );
};

export default OrderTracker;
