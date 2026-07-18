import { useState } from "react";
import { Plus, Trash2, Tag, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useMyCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks/useCoupon";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "",
  usageLimit: "",
  expiresAt: "",
};

const OwnerCoupons = () => {
  const { data: coupons, isLoading } = useMyCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      toast({ title: "Code and discount value are required", variant: "destructive" });
      return;
    }
    createCoupon.mutate(
      {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
        expiresAt: form.expiresAt || null,
      },
      {
        onSuccess: () => {
          toast({ title: "Coupon created" });
          setOpen(false);
          setForm(emptyForm);
        },
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
      },
    );
  };

  const toggleActive = (c) =>
    updateCoupon.mutate(
      { id: c._id, data: { isActive: !c.isActive } },
      {
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      },
    );

  const remove = (id) =>
    deleteCoupon.mutate(id, {
      onSuccess: () => toast({ title: "Coupon deleted" }),
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons ({coupons?.length ?? 0})</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white">
              <Plus className="h-4 w-4" /> New coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Code">
                <Input
                  value={form.code}
                  onChange={set("code")}
                  placeholder="SAVE20"
                  className="uppercase"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select
                    value={form.discountType}
                    onChange={set("discountType")}
                    className="h-10 w-full rounded-md border border-input px-3 text-sm"
                  >
                    <option value="percentage">Percentage %</option>
                    <option value="flat">Flat ₹</option>
                  </select>
                </Field>
                <Field label="Value">
                  <Input
                    type="number"
                    value={form.discountValue}
                    onChange={set("discountValue")}
                    placeholder={form.discountType === "percentage" ? "20" : "50"}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Max discount (₹)">
                  <Input
                    type="number"
                    value={form.maxDiscount}
                    onChange={set("maxDiscount")}
                    placeholder="0 = none"
                  />
                </Field>
                <Field label="Min order (₹)">
                  <Input
                    type="number"
                    value={form.minOrderValue}
                    onChange={set("minOrderValue")}
                    placeholder="0"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Usage limit">
                  <Input
                    type="number"
                    value={form.usageLimit}
                    onChange={set("usageLimit")}
                    placeholder="0 = ∞"
                  />
                </Field>
                <Field label="Expires">
                  <Input type="date" value={form.expiresAt} onChange={set("expiresAt")} />
                </Field>
              </div>
              <Button
                type="submit"
                disabled={createCoupon.isPending}
                className="w-full bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white font-bold"
              >
                {createCoupon.isPending ? "Creating…" : "Create coupon"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!coupons?.length ? (
        <EmptyState icon="🎟️" title="No coupons yet" />
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <Card key={c._id}>
              <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-amber-100 grid place-items-center shrink-0">
                  <Tag className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold font-mono">{c.code}</p>
                    <Badge variant={c.isActive ? "default" : "secondary"}>
                      {c.isActive ? "Active" : "Off"}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}% off`
                      : `${formatPrice(c.discountValue)} off`}
                    {c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ""}
                    {c.minOrderValue ? ` · min ${formatPrice(c.minOrderValue)}` : ""}
                    {c.usageLimit
                      ? ` · ${c.usedCount}/${c.usageLimit} used`
                      : ` · ${c.usedCount} used`}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="h-8" onClick={() => toggleActive(c)}>
                  <Power className="h-3.5 w-3.5 mr-1" /> {c.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-destructive"
                  onClick={() => remove(c._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <Label className="text-xs font-semibold text-stone-600">{label}</Label>
    {children}
  </div>
);

export default OwnerCoupons;
