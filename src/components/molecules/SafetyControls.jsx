import { ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRaiseSos, useReportIncident } from "@/hooks/useSafety";
import { useToast } from "@/store/Toast";

// Best-effort current position; resolves to {} if unavailable so the alert
// still goes out without coordinates.
const withPosition = (fn) => {
  if (typeof navigator === "undefined" || !navigator.geolocation) return fn({});
  navigator.geolocation.getCurrentPosition(
    (pos) => fn({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => fn({}),
    { timeout: 5000, maximumAge: 15000 },
  );
};

const SafetyControls = () => {
  const sos = useRaiseSos();
  const incident = useReportIncident();
  const { toast } = useToast();

  const triggerSos = () => {
    if (!window.confirm("Send an emergency SOS? Support and admins will be alerted immediately."))
      return;
    withPosition((coords) =>
      sos.mutate(coords, {
        onSuccess: () => toast({ title: "🆘 SOS sent — support has been alerted" }),
        onError: () => toast({ title: "Could not send SOS", variant: "destructive" }),
      }),
    );
  };

  const reportIncident = () => {
    const description = window.prompt("Describe the incident (shown to support):");
    if (!description || !description.trim()) return;
    withPosition((coords) =>
      incident.mutate(
        { category: "other", description: description.trim(), ...coords },
        {
          onSuccess: () => toast({ title: "Incident reported" }),
          onError: (err) =>
            toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
        },
      ),
    );
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4" /> Safety
        </p>
        <button
          onClick={reportIncident}
          disabled={incident.isPending}
          className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 mt-0.5"
        >
          <AlertTriangle className="h-3 w-3" /> Report an incident
        </button>
      </div>
      <Button
        onClick={triggerSos}
        disabled={sos.isPending}
        className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-red-600/20"
      >
        SOS
      </Button>
    </div>
  );
};

export default SafetyControls;
