import { useState } from "react";
import { Bike, MapPin, Package, Star, Store, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useAdminRiders, useAdminActiveOrders, useAdminAssignRider } from "@/hooks/useDispatch";
import { useToast } from "../../store/Toast";
import { formatPrice } from "@/lib/utils";

const AVAIL_CLS = {
  online: "bg-emerald-100 text-emerald-700",
  busy: "bg-amber-100 text-amber-700",
  break: "bg-sky-100 text-sky-700",
  offline: "bg-stone-100 text-stone-500",
};

const ASSIGN_LABEL = {
  unassigned: "Unassigned",
  searching: "Finding rider…",
  offered: "Offered",
  accepted: "Assigned",
  failed: "No rider",
};

const AdminDeliveryOps = () => {
  const { data: riders, isLoading: ridersLoading } = useAdminRiders();
  const { data: orders, isLoading: ordersLoading } = useAdminActiveOrders();
  const assign = useAdminAssignRider();
  const { toast } = useToast();
  const [picks, setPicks] = useState({});

  const onlineRiders = (riders || []).filter((r) => r.availabilityStatus !== "offline");

  const doAssign = (orderId) => {
    const partnerId = picks[orderId];
    if (!partnerId) return;
    assign.mutate(
      { orderId, partnerId },
      {
        onSuccess: () => toast({ title: "Rider assigned" }),
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Assign failed", variant: "destructive" }),
      },
    );
  };

  if (ridersLoading || ordersLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Delivery Operations</h1>

      {/* Live riders */}
      <section>
        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-2">
          Riders ({riders?.length ?? 0})
        </h2>
        {!riders?.length ? (
          <EmptyState icon="🛵" title="No approved riders" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {riders.map((r) => (
              <Card key={r._id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm flex items-center gap-1.5 truncate">
                      <Bike className="h-4 w-4 text-[#0F766E] shrink-0" /> {r.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${AVAIL_CLS[r.availabilityStatus]}`}
                    >
                      {r.availabilityStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1.5">
                    <span className="flex items-center gap-0.5">
                      <Package className="h-3 w-3" /> {r.activeDeliveries} active
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" /> {r.rating?.toFixed?.(1) ?? "0.0"}
                    </span>
                    <span>{r.totalDeliveries} total</span>
                    {r.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" /> live
                      </span>
                    )}
                  </div>
                  {r.metrics?.offersReceived > 0 && (
                    <p className="text-[10px] text-stone-400 mt-1">
                      Accept rate:{" "}
                      {Math.round((r.metrics.offersAccepted / r.metrics.offersReceived) * 100)}%
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Active deliveries */}
      <section>
        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-2">
          Active deliveries ({orders?.length ?? 0})
        </h2>
        {!orders?.length ? (
          <EmptyState icon="📦" title="No in-flight deliveries" />
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Card key={o._id}>
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-1.5 truncate">
                      <Store className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {o.vendor?.name || "Store"} → {o.deliveryAddress?.city || "—"}
                    </p>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <User className="h-3 w-3" /> {o.customer?.name || "Customer"} ·{" "}
                      {formatPrice(o.totalPrice)} · {o.orderStatus.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {o.deliveryPartner ? (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {o.deliveryPartner.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {ASSIGN_LABEL[o.assignment?.status] || "Unassigned"}
                      </Badge>
                    )}
                    <select
                      value={picks[o._id] || ""}
                      onChange={(e) => setPicks((p) => ({ ...p, [o._id]: e.target.value }))}
                      className="h-8 rounded-lg border border-stone-200 bg-white px-2 text-xs max-w-[9rem]"
                    >
                      <option value="">Assign rider…</option>
                      {onlineRiders.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.availabilityStatus})
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="h-8"
                      disabled={!picks[o._id] || assign.isPending}
                      onClick={() => doAssign(o._id)}
                    >
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDeliveryOps;
