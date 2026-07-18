import { useState } from "react";
import {
  Download,
  ShieldOff,
  Wallet,
  Package,
  Monitor,
  Clock,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/atoms/Spinner";
import { useUserProfile, useGdprEraseUser, useBlockUser } from "@/hooks/useAdmin";
import { adminApi } from "@/api/admin.api";
import { useToast } from "../../store/Toast";
import { formatPrice, formatDate } from "@/lib/utils";

const Stat = ({ label, value, tone = "text-stone-800" }) => (
  <div className="rounded-lg bg-stone-50 dark:bg-stone-900 p-3">
    <p className="text-[11px] uppercase tracking-wide text-stone-400">{label}</p>
    <p className={`text-lg font-bold ${tone}`}>{value}</p>
  </div>
);

/**
 * Customer 360 view (Phase 5, P5-3). Everything an operator needs about one
 * user in a single dialog: identity, order stats, recent orders, wallet,
 * devices, login history — plus GDPR data export + erasure.
 */
const UserProfile360 = ({ userId, open, onClose }) => {
  const { data, isLoading } = useUserProfile(open ? userId : null);
  const gdprErase = useGdprEraseUser();
  const blockUser = useBlockUser();
  const { toast } = useToast();
  const [erasing, setErasing] = useState(false);

  const u = data?.user;

  const exportJson = async () => {
    try {
      const res = await adminApi.exportUser(userId);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-${userId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Data exported" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const erase = () => {
    if (
      !window.confirm(
        "Anonymize and permanently remove this user's personal data? This cannot be undone.",
      )
    )
      return;
    setErasing(true);
    gdprErase.mutate(userId, {
      onSuccess: () => {
        toast({ title: "User anonymized" });
        setErasing(false);
        onClose();
      },
      onError: () => {
        toast({ title: "Erase failed", variant: "destructive" });
        setErasing(false);
      },
    });
  };

  const toggleBlock = () =>
    blockUser.mutate(
      { id: userId, isBlocked: !u.isBlocked },
      {
        onSuccess: () => toast({ title: u.isBlocked ? "User unblocked" : "User blocked" }),
        onError: () => toast({ title: "Action failed", variant: "destructive" }),
      },
    );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer 360</DialogTitle>
        </DialogHeader>

        {isLoading || !u ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Identity */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-lg">{u.name}</p>
                  <Badge variant="secondary" className="capitalize">
                    {u.role}
                  </Badge>
                  {u.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                {u.phone && <p className="text-sm text-muted-foreground">{u.phone}</p>}
                <p className="text-xs text-stone-400 mt-1">Joined {formatDate(u.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={exportJson}>
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
                <Button size="sm" variant="outline" onClick={toggleBlock}>
                  {u.isBlocked ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> Unblock
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4 mr-1 text-orange-500" /> Block
                    </>
                  )}
                </Button>
                <Button size="sm" variant="destructive" onClick={erase} disabled={erasing}>
                  <ShieldOff className="h-4 w-4 mr-1" /> GDPR erase
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label="Orders" value={data.stats.orders} />
              <Stat label="Spent" value={formatPrice(data.stats.spent)} tone="text-green-600" />
              <Stat label="Avg order" value={formatPrice(data.stats.avgOrderValue)} />
              <Stat label="Cancelled" value={data.stats.cancelled} tone="text-red-500" />
            </div>

            {/* Wallet */}
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2">
                <Wallet className="h-4 w-4" /> Wallet — {formatPrice(data.wallet.balance)}
              </h3>
              {!data.wallet.transactions.length ? (
                <p className="text-xs text-stone-400">No wallet activity.</p>
              ) : (
                <div className="space-y-1">
                  {data.wallet.transactions.slice(0, 5).map((t) => (
                    <div key={t._id} className="flex justify-between text-xs text-muted-foreground">
                      <span>{t.description || t.type}</span>
                      <span className={t.amount >= 0 ? "text-green-600" : "text-red-500"}>
                        {t.amount >= 0 ? "+" : ""}
                        {formatPrice(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent orders */}
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2">
                <Package className="h-4 w-4" /> Recent orders
              </h3>
              {!data.recentOrders.length ? (
                <p className="text-xs text-stone-400">No orders.</p>
              ) : (
                <div className="space-y-1">
                  {data.recentOrders.map((o) => (
                    <div key={o._id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {o.orderStatus}
                      </Badge>
                      <span className="font-medium">{formatPrice(o.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices */}
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2">
                <Monitor className="h-4 w-4" /> Devices
              </h3>
              {!data.devices.length ? (
                <p className="text-xs text-stone-400">No login records.</p>
              ) : (
                <div className="space-y-1">
                  {data.devices.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {d.browser} on {d.os}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span>{d.ip}</span>
                      <span className="text-stone-300">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(d.lastSeen)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile360;
