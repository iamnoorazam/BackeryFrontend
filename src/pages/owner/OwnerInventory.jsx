import { useState } from "react";
import { Plus, Minus, History, Package, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useInventory, useAdjustStock, useInventoryLogs } from "@/hooks/useInventory";
import { useToast } from "@/store/Toast";
import { formatDate } from "@/lib/utils";

const STATUS = {
  ok: { label: "In stock", cls: "bg-emerald-100 text-emerald-700" },
  low: { label: "Low", cls: "bg-amber-100 text-amber-700" },
  out: { label: "Out", cls: "bg-red-100 text-red-700" },
};

const AdjustRow = ({ product, onAdjust, adjusting }) => {
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const s = STATUS[product.stockStatus] || STATUS.ok;

  const doAdjust = (sign) => {
    const n = Number(qty);
    if (!n || n <= 0) return;
    onAdjust(product._id, sign * n, reason, () => {
      setQty("");
      setReason("");
    });
  };

  return (
    <Card>
      <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt=""
              className="w-11 h-11 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-stone-100 grid place-items-center shrink-0">
              <Package className="h-5 w-5 text-stone-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate">{product.name}</p>
            <p className="text-xs text-stone-500">
              {product.category?.name} ·{" "}
              <span className="font-bold text-stone-700">{product.stock}</span> in stock
            </p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>
            {s.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Qty"
            className="w-20 h-9 rounded-lg"
          />
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason"
            className="w-32 h-9 rounded-lg"
          />
          <Button
            size="icon"
            className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700"
            disabled={adjusting}
            onClick={() => doAdjust(1)}
            title="Restock"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            disabled={adjusting}
            onClick={() => doAdjust(-1)}
            title="Reduce"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const LogsDialog = ({ productId, name, onClose }) => {
  const { data: logs, isLoading } = useInventoryLogs(productId, !!productId);
  return (
    <Dialog
      open={!!productId}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stock history — {name}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner />
          </div>
        ) : !logs?.length ? (
          <p className="text-sm text-stone-500 py-6 text-center">No movements yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {logs.map((l) => (
              <div
                key={l._id}
                className="flex items-center justify-between text-sm border-b border-stone-100 pb-1.5"
              >
                <div>
                  <span
                    className={`font-bold ${l.change > 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {l.change > 0 ? "+" : ""}
                    {l.change}
                  </span>
                  <span className="text-stone-400"> → {l.resultingStock}</span>
                  {l.reason && <span className="text-stone-500"> · {l.reason}</span>}
                </div>
                <span className="text-[10px] text-stone-400">{formatDate(l.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const OwnerInventory = () => {
  const { data, isLoading } = useInventory();
  const adjust = useAdjustStock();
  const { toast } = useToast();
  const [logsFor, setLogsFor] = useState(null);

  const onAdjust = (productId, change, reason, reset) =>
    adjust.mutate(
      { productId, change, reason },
      {
        onSuccess: () => {
          toast({ title: "Stock updated" });
          reset?.();
        },
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Adjust failed", variant: "destructive" }),
      },
    );

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  const items = data?.items || [];
  const summary = data?.summary || { ok: 0, low: 0, out: 0 };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold">Inventory ({data?.total ?? 0})</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Package} label="In stock" value={summary.ok} cls="text-emerald-600" />
        <Stat icon={AlertTriangle} label="Low stock" value={summary.low} cls="text-amber-600" />
        <Stat icon={XCircle} label="Out of stock" value={summary.out} cls="text-red-600" />
      </div>

      {!items.length ? (
        <EmptyState icon="📦" title="No products yet" />
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p._id} className="relative">
              <AdjustRow product={p} onAdjust={onAdjust} adjusting={adjust.isPending} />
              <button
                onClick={() => setLogsFor(p)}
                className="absolute top-1 right-1 text-stone-300 hover:text-stone-600 p-1"
                title="History"
              >
                <History className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {logsFor && (
        <LogsDialog productId={logsFor._id} name={logsFor.name} onClose={() => setLogsFor(null)} />
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, cls }) => (
  <div className="rounded-2xl bg-white border border-stone-200 p-4 text-center">
    <Icon className={`h-5 w-5 mx-auto ${cls}`} />
    <p className={`text-2xl font-bold mt-1 ${cls}`}>{value}</p>
    <p className="text-xs text-stone-500">{label}</p>
  </div>
);

export default OwnerInventory;
