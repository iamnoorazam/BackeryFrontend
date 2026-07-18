import { useEffect, useState } from "react";
import { Loader2, Store, Zap, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyStore, useUpdateMyStore, useSetStatus } from "@/hooks/useMerchant";
import { useToast } from "@/store/Toast";

const emptyForm = {
  description: "",
  minOrderValue: 0,
  packagingCharge: 0,
  deliveryRadiusKm: 20,
  prepTimeMinutes: 20,
  taxRatePercent: 0,
  avgDeliveryTime: "",
  opensAt: "",
  closesAt: "",
  autoAcceptOrders: false,
  notificationPrefs: { orders: true, lowStock: true, payments: true, reviews: true },
};

const NOTIF_PREFS = [
  { key: "orders", label: "New order alerts" },
  { key: "lowStock", label: "Low-stock alerts" },
  { key: "payments", label: "Payment & settlement alerts" },
  { key: "reviews", label: "Review alerts" },
];

const MerchantSettings = () => {
  const { toast } = useToast();
  const { data: store, isLoading } = useMyStore();
  const update = useUpdateMyStore();
  const setStatus = useSetStatus();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!store) return;
    setForm({
      description: store.description || "",
      minOrderValue: store.minOrderValue ?? 0,
      packagingCharge: store.packagingCharge ?? 0,
      deliveryRadiusKm: store.deliveryRadiusKm ?? 20,
      prepTimeMinutes: store.prepTimeMinutes ?? 20,
      taxRatePercent: store.taxRatePercent ?? 0,
      avgDeliveryTime: store.avgDeliveryTime || "",
      opensAt: store.opensAt || "",
      closesAt: store.closesAt || "",
      autoAcceptOrders: !!store.autoAcceptOrders,
      notificationPrefs: { ...emptyForm.notificationPrefs, ...(store.notificationPrefs || {}) },
    });
  }, [store]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D2691E]" />
      </div>
    );
  }
  if (!store) return <div className="p-8 text-center text-stone-500">No store found.</div>;

  const set = (key, isNum) => (e) =>
    setForm((f) => ({ ...f, [key]: isNum ? e.target.value : e.target.value }));

  const toggleStatus = (patch) =>
    setStatus.mutate(patch, {
      onError: () => toast({ title: "Could not update status", variant: "destructive" }),
    });

  const handleSave = () =>
    update.mutate(
      {
        ...form,
        minOrderValue: Number(form.minOrderValue),
        packagingCharge: Number(form.packagingCharge),
        deliveryRadiusKm: Number(form.deliveryRadiusKm),
        prepTimeMinutes: Number(form.prepTimeMinutes),
        taxRatePercent: Number(form.taxRatePercent),
        notificationPrefs: form.notificationPrefs,
      },
      {
        onSuccess: () => toast({ title: "Settings saved" }),
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Save failed", variant: "destructive" }),
      },
    );

  const isOpen = store.isOpen;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] grid place-items-center">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Store settings</h1>
          <p className="text-sm text-stone-500">{store.name}</p>
        </div>
      </div>

      {/* Live operational toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToggleCard
          active={!store.isManuallyClosed && isOpen}
          onClick={() => toggleStatus({ isManuallyClosed: !store.isManuallyClosed })}
          icon={Power}
          title={store.isManuallyClosed ? "Store is OFFLINE" : "Store is ONLINE"}
          subtitle={store.isManuallyClosed ? "Tap to go online" : "Tap to go offline"}
          tone={store.isManuallyClosed ? "red" : "emerald"}
        />
        <ToggleCard
          active={store.busyMode}
          onClick={() => toggleStatus({ busyMode: !store.busyMode })}
          icon={Zap}
          title={store.busyMode ? "Busy mode ON" : "Busy mode OFF"}
          subtitle="Longer prep time shown to customers"
          tone={store.busyMode ? "amber" : "stone"}
        />
      </div>

      {/* Commerce settings */}
      <Card title="Orders & delivery">
        <Row>
          <Field label="Min order value (₹)">
            <Input
              type="number"
              value={form.minOrderValue}
              onChange={set("minOrderValue", true)}
              className={inp}
            />
          </Field>
          <Field label="Packaging charge (₹)">
            <Input
              type="number"
              value={form.packagingCharge}
              onChange={set("packagingCharge", true)}
              className={inp}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Delivery radius (km)">
            <Input
              type="number"
              value={form.deliveryRadiusKm}
              onChange={set("deliveryRadiusKm", true)}
              className={inp}
            />
          </Field>
          <Field label="Prep time (min)">
            <Input
              type="number"
              value={form.prepTimeMinutes}
              onChange={set("prepTimeMinutes", true)}
              className={inp}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Tax rate (%)">
            <Input
              type="number"
              value={form.taxRatePercent}
              onChange={set("taxRatePercent", true)}
              className={inp}
            />
          </Field>
          <Field label="Avg delivery time">
            <Input
              value={form.avgDeliveryTime}
              onChange={set("avgDeliveryTime")}
              placeholder="30-40 min"
              className={inp}
            />
          </Field>
        </Row>
      </Card>

      <Card title="Business hours (24h)">
        <Row>
          <Field label="Opens at">
            <Input
              value={form.opensAt}
              onChange={set("opensAt")}
              placeholder="09:00"
              className={inp}
            />
          </Field>
          <Field label="Closes at">
            <Input
              value={form.closesAt}
              onChange={set("closesAt")}
              placeholder="22:00"
              className={inp}
            />
          </Field>
        </Row>
        <p className="text-xs text-stone-400">Leave both blank to stay open 24/7.</p>
      </Card>

      <Card title="Automation">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.autoAcceptOrders}
            onChange={(e) => setForm((f) => ({ ...f, autoAcceptOrders: e.target.checked }))}
            className="h-4 w-4 accent-[#D2691E]"
          />
          <span className="text-sm text-stone-700">
            Auto-accept incoming orders (skip the manual accept step)
          </span>
        </label>
      </Card>

      <Card title="Notifications">
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
              className="h-4 w-4 accent-[#D2691E]"
            />
            <span className="text-sm text-stone-700">{p.label}</span>
          </label>
        ))}
      </Card>

      <Button
        onClick={handleSave}
        disabled={update.isPending}
        className="rounded-xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white font-bold px-8"
      >
        {update.isPending ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
};

const inp =
  "h-11 rounded-xl bg-white border-2 border-stone-200 focus-visible:border-[#D2691E] w-full";
const toneCls = {
  emerald: "border-emerald-300 bg-emerald-50 text-emerald-700",
  red: "border-red-300 bg-red-50 text-red-700",
  amber: "border-amber-300 bg-amber-50 text-amber-700",
  stone: "border-stone-200 bg-white text-stone-600",
};

const ToggleCard = ({ active, onClick, icon: Icon, title, subtitle, tone }) => (
  <button
    onClick={onClick}
    className={`text-left rounded-2xl border-2 p-4 transition-all ${toneCls[tone]}`}
  >
    <div className="flex items-center gap-2 font-bold">
      <Icon className="h-5 w-5" /> {title}
    </div>
    <p className="text-xs mt-1 opacity-80">{subtitle}</p>
  </button>
);

const Card = ({ title, children }) => (
  <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
    <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">{title}</h2>
    {children}
  </div>
);
const Row = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
);
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-stone-600">{label}</Label>
    {children}
  </div>
);

export default MerchantSettings;
