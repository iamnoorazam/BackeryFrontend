import { useState } from "react";
import { ShieldCheck, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useAdminTeam, useCreateTeamMember, useUpdateTeamRole } from "@/hooks/useAdmin";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

// Operator personas (must mirror the backend ADMIN_ROLE_PERMISSIONS map).
const ROLES = [
  { value: "super_admin", label: "Super Admin", desc: "Full access to everything." },
  { value: "finance", label: "Finance", desc: "Revenue, wallets, settlements, audit." },
  { value: "operations", label: "Operations", desc: "Orders, dispatch, approvals." },
  { value: "support", label: "Support", desc: "Users & orders (read), tickets." },
  { value: "marketing", label: "Marketing", desc: "Categories / CMS, stats." },
  { value: "analyst", label: "Analyst", desc: "Read-only stats, orders, audit." },
];

const roleMeta = (v) => ROLES.find((r) => r.value === v) || { label: v, desc: "" };
const roleBadge = (v) => (v === "super_admin" ? "default" : "secondary");

const AdminTeam = () => {
  const { data: team, isLoading } = useAdminTeam();
  const createMember = useCreateTeamMember();
  const updateRole = useUpdateTeamRole();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", adminRole: "operations" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast({ title: "Name, email and password are required", variant: "destructive" });
    }
    createMember.mutate(form, {
      onSuccess: () => {
        toast({ title: "Team member added" });
        setForm({ name: "", email: "", password: "", adminRole: "operations" });
      },
      onError: (err) =>
        toast({
          title: err?.response?.data?.message || "Could not create member",
          variant: "destructive",
        }),
    });
  };

  const changeRole = (id, adminRole) =>
    updateRole.mutate(
      { id, adminRole },
      {
        onSuccess: () => toast({ title: "Role updated" }),
        onError: (err) =>
          toast({
            title: err?.response?.data?.message || "Could not update role",
            variant: "destructive",
          }),
      },
    );

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Team &amp; Roles ({team?.length ?? 0})</h1>
      </div>

      {/* Add member */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-5 md:items-end">
            <div className="md:col-span-1">
              <Label className="text-xs">Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Role</Label>
              <Select value={form.adminRole} onValueChange={(v) => set("adminRole", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createMember.isPending} className="md:col-span-1">
              {createMember.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <UserPlus className="h-4 w-4 mr-1" />
              )}
              Add member
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">{roleMeta(form.adminRole).desc}</p>
        </CardContent>
      </Card>

      {/* Team list */}
      {!team?.length ? (
        <EmptyState icon="🛡️" title="No admin accounts" />
      ) : (
        <div className="space-y-2">
          {team.map((m) => (
            <Card key={m._id}>
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{m.name}</p>
                    <Badge variant={roleBadge(m.adminRole)}>{roleMeta(m.adminRole).label}</Badge>
                    {m.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Added {formatDate(m.createdAt)}
                  </p>
                </div>
                <div className="w-44 shrink-0">
                  <Select value={m.adminRole} onValueChange={(v) => changeRole(m._id, v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
