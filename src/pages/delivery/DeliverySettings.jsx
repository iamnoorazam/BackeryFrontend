import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/atoms/Spinner";
import { useMyPartnerProfile, useUpdateMyPartnerProfile } from "@/hooks/useDeliveryPartner";
import { useZones } from "@/hooks/useDeliveryConfig";
import { useToast } from "@/store/Toast";

const NOTIF_PREFS = [
  { key: "orders", label: "New order offers" },
  { key: "earnings", label: "Earnings & payouts" },
  { key: "shifts", label: "Shift reminders" },
  { key: "system", label: "System announcements" },
];

const emptyForm = {
  workingCity: "",
  workingZone: "",
  preferredRadiusKm: 5,
  notificationPrefs: { orders: true, earnings: true, shifts: true, system: true },
};

const DeliverySettings = () => {
  const { data: partner, isLoading } = useMyPartnerProfile();
  const { data: zones } = useZones(true);
  const update = useUpdateMyPartnerProfile();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!partner) return;
    setForm({
      workingCity: partner.workingCity || "",
      workingZone: partner.workingZone || "",
      preferredRadiusKm: partner.preferredRadiusKm ?? 5,
      notificationPrefs: { ...emptyForm.notificationPrefs, ...(partner.notificationPrefs || {}) },
    });
  }, [partner]);

  const save = () => {
    update.mutate(form, {
      onSuccess: () => toast({ title: "Settings saved" }),
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Save failed", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/delivery/dashboard" className="text-stone-400 hover:text-stone-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-stone-900">Settings</h1>
        </div>

        {/* Work preferences */}
        <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Work area</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-600">Working city</Label>
              <Input
                value={form.workingCity}
                onChange={(e) => setForm((f) => ({ ...f, workingCity: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-600">Preferred radius (km)</Label>
              <Input
                type="number"
                min="1"
                value={form.preferredRadiusKm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, preferredRadiusKm: Number(e.target.value) }))
                }
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-stone-600">Working zone</Label>
            <select
              value={form.workingZone}
              onChange={(e) => setForm((f) => ({ ...f, workingZone: e.target.value }))}
              className="h-11 rounded-xl border-2 border-stone-200 bg-white px-3 text-sm w-full"
            >
              <option value="">No preference</option>
              {(zones || []).map((z) => (
                <option key={z._id} value={z.name}>
                  {z.name}
                  {z.city ? ` — ${z.city}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
            <Bell className="h-4 w-4" /> Notifications
          </h2>
          {NOTIF_PREFS.map((p) => (
            <label key={p.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.notificationPrefs[p.key]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    notificationPrefs: { ...f.notificationPrefs, [p.key]: e.target.checked },
                  }))
                }
                className="h-4 w-4 accent-[#0F766E]"
              />
              <span className="text-sm text-stone-700">{p.label}</span>
            </label>
          ))}
        </div>

        <Button
          onClick={save}
          disabled={update.isPending}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] text-white font-bold"
        >
          {update.isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
};

export default DeliverySettings;
