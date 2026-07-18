import { useState } from "react";
import { Plus, Trash2, UserCog, Power } from "lucide-react";
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
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useStaff";
import { useToast } from "@/store/Toast";

const ROLES = ["manager", "order_manager", "cashier", "kitchen", "support"];
const PERMISSIONS = [
  { key: "store:dashboard", label: "View dashboard" },
  { key: "orders:fulfill", label: "Manage orders" },
  { key: "products:manage", label: "Manage products" },
];
const ROLE_DEFAULTS = {
  manager: ["store:dashboard", "orders:fulfill", "products:manage"],
  order_manager: ["store:dashboard", "orders:fulfill"],
  cashier: ["store:dashboard", "orders:fulfill"],
  kitchen: ["store:dashboard", "orders:fulfill"],
  support: ["store:dashboard"],
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  staffRole: "support",
  permissions: ROLE_DEFAULTS.support,
};

const OwnerStaff = () => {
  const { data: staff, isLoading } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const setRole = (role) =>
    setForm((f) => ({ ...f, staffRole: role, permissions: ROLE_DEFAULTS[role] }));
  const togglePerm = (key) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast({ title: "Name, email and password are required", variant: "destructive" });
      return;
    }
    createStaff.mutate(form, {
      onSuccess: () => {
        toast({ title: "Staff added" });
        setOpen(false);
        setForm(emptyForm);
      },
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
    });
  };

  const toggleActive = (s) =>
    updateStaff.mutate(
      { id: s._id, data: { isActive: !s.isActive } },
      {
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      },
    );

  const remove = (id) =>
    deleteStaff.mutate(id, {
      onSuccess: () => toast({ title: "Staff removed" }),
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
        <h1 className="text-2xl font-bold">Staff ({staff?.length ?? 0})</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white">
              <Plus className="h-4 w-4" /> Add staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add staff member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Name">
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </Field>
                <Field label="Password">
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Role">
                <select
                  value={form.staffRole}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-10 w-full rounded-md border border-input px-3 text-sm capitalize"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-600">Permissions</Label>
                <div className="space-y-1.5">
                  {PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        className="h-4 w-4 accent-[#D2691E]"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                disabled={createStaff.isPending}
                className="w-full bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white font-bold"
              >
                {createStaff.isPending ? "Adding…" : "Add staff"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!staff?.length ? (
        <EmptyState icon="🧑‍🍳" title="No staff yet" />
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <Card key={s._id}>
              <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-stone-100 grid place-items-center shrink-0">
                  <UserCog className="h-5 w-5 text-stone-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{s.user?.name}</p>
                    <Badge variant="secondary" className="capitalize">
                      {s.staffRole.replace(/_/g, " ")}
                    </Badge>
                    {!s.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-stone-500 truncate">
                    {s.user?.email} · {s.permissions?.length || 0} permissions
                  </p>
                </div>
                <Button size="sm" variant="outline" className="h-8" onClick={() => toggleActive(s)}>
                  <Power className="h-3.5 w-3.5 mr-1" /> {s.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-destructive"
                  onClick={() => remove(s._id)}
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

export default OwnerStaff;
