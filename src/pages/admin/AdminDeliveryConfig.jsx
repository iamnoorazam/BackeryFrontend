import { useState } from "react";
import { MapPin, Gift, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import {
  useZones,
  useAdminIncentives,
  useCreateZone,
  useDeleteZone,
  useCreateIncentive,
  useDeleteIncentive,
} from "@/hooks/useDeliveryConfig";
import { useToast } from "../../store/Toast";
import { formatPrice, formatDate } from "@/lib/utils";

const emptyZone = { name: "", city: "", radiusKm: 5 };
const nowLocal = (offsetH = 0) =>
  new Date(Date.now() + offsetH * 3600000).toISOString().slice(0, 16);
const emptyInc = () => ({
  title: "",
  type: "bonus",
  perDeliveryBonus: 20,
  city: "",
  startAt: nowLocal(0),
  endAt: nowLocal(6),
});

const AdminDeliveryConfig = () => {
  const { data: zones, isLoading: zLoading } = useZones();
  const { data: incentives, isLoading: iLoading } = useAdminIncentives();
  const createZone = useCreateZone();
  const deleteZone = useDeleteZone();
  const createInc = useCreateIncentive();
  const deleteInc = useDeleteIncentive();
  const { toast } = useToast();
  const [zone, setZone] = useState(emptyZone);
  const [inc, setInc] = useState(emptyInc);

  const okErr = (label) => ({
    onSuccess: () => toast({ title: `${label}` }),
    onError: (err) =>
      toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
  });

  const submitZone = (e) => {
    e.preventDefault();
    if (!zone.name.trim()) return;
    createZone.mutate(zone, {
      ...okErr("Zone created"),
      onSuccess: () => {
        toast({ title: "Zone created" });
        setZone(emptyZone);
      },
    });
  };

  const submitInc = (e) => {
    e.preventDefault();
    if (!inc.title.trim()) return;
    createInc.mutate(inc, {
      onSuccess: () => {
        toast({ title: "Incentive created" });
        setInc(emptyInc());
      },
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
    });
  };

  if (zLoading || iLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Delivery Config</h1>

      {/* Zones */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
          <MapPin className="h-4 w-4" /> Delivery zones ({zones?.length ?? 0})
        </h2>
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submitZone} className="flex flex-wrap items-end gap-2">
              <Field label="Name">
                <Input
                  value={zone.name}
                  onChange={(e) => setZone((z) => ({ ...z, name: e.target.value }))}
                  className="h-9 w-40"
                />
              </Field>
              <Field label="City">
                <Input
                  value={zone.city}
                  onChange={(e) => setZone((z) => ({ ...z, city: e.target.value }))}
                  className="h-9 w-36"
                />
              </Field>
              <Field label="Radius km">
                <Input
                  type="number"
                  value={zone.radiusKm}
                  onChange={(e) => setZone((z) => ({ ...z, radiusKm: Number(e.target.value) }))}
                  className="h-9 w-24"
                />
              </Field>
              <Button type="submit" size="sm" className="h-9" disabled={createZone.isPending}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </form>
          </CardContent>
        </Card>
        {!zones?.length ? (
          <EmptyState icon="🗺️" title="No zones yet" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {zones.map((z) => (
              <Card key={z._id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {z.name}{" "}
                      {!z.isActive && (
                        <Badge variant="secondary" className="text-[9px]">
                          inactive
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-stone-500">
                      {z.city || "—"} · {z.radiusKm} km
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      deleteZone.mutate(z._id, {
                        onSuccess: () => toast({ title: "Zone deleted" }),
                      })
                    }
                    className="text-stone-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Incentives */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
          <Gift className="h-4 w-4" /> Incentive schemes ({incentives?.length ?? 0})
        </h2>
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submitInc} className="flex flex-wrap items-end gap-2">
              <Field label="Title">
                <Input
                  value={inc.title}
                  onChange={(e) => setInc((i) => ({ ...i, title: e.target.value }))}
                  className="h-9 w-40"
                />
              </Field>
              <Field label="Type">
                <select
                  value={inc.type}
                  onChange={(e) => setInc((i) => ({ ...i, type: e.target.value }))}
                  className="h-9 rounded-md border border-stone-200 px-2 text-sm"
                >
                  {["peak", "rain", "festival", "referral", "bonus"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="₹ / delivery">
                <Input
                  type="number"
                  value={inc.perDeliveryBonus}
                  onChange={(e) =>
                    setInc((i) => ({ ...i, perDeliveryBonus: Number(e.target.value) }))
                  }
                  className="h-9 w-24"
                />
              </Field>
              <Field label="City (blank=all)">
                <Input
                  value={inc.city}
                  onChange={(e) => setInc((i) => ({ ...i, city: e.target.value }))}
                  className="h-9 w-28"
                />
              </Field>
              <Field label="Start">
                <Input
                  type="datetime-local"
                  value={inc.startAt}
                  onChange={(e) => setInc((i) => ({ ...i, startAt: e.target.value }))}
                  className="h-9 w-44"
                />
              </Field>
              <Field label="End">
                <Input
                  type="datetime-local"
                  value={inc.endAt}
                  onChange={(e) => setInc((i) => ({ ...i, endAt: e.target.value }))}
                  className="h-9 w-44"
                />
              </Field>
              <Button type="submit" size="sm" className="h-9" disabled={createInc.isPending}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </form>
          </CardContent>
        </Card>
        {!incentives?.length ? (
          <EmptyState icon="🎁" title="No incentive schemes" />
        ) : (
          <div className="space-y-2">
            {incentives.map((i) => {
              const live =
                i.isActive && new Date(i.startAt) <= new Date() && new Date(i.endAt) >= new Date();
              return (
                <Card key={i._id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm flex items-center gap-2 truncate">
                        {i.title}
                        <span className="text-[10px] uppercase text-stone-400">{i.type}</span>
                        {live && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">live</Badge>
                        )}
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatPrice(i.perDeliveryBonus)}/delivery · {i.city || "all cities"} ·{" "}
                        {formatDate(i.startAt)} → {formatDate(i.endAt)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        deleteInc.mutate(i._id, {
                          onSuccess: () => toast({ title: "Incentive deleted" }),
                        })
                      }
                      className="text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-semibold text-stone-500">{label}</label>
    {children}
  </div>
);

export default AdminDeliveryConfig;
