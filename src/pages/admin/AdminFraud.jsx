import { useState } from "react";
import { ShieldAlert, Radar, Flag, Play, Ban, Check, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import {
  useRiskOverview,
  useRiskyCustomers,
  useRiskFlags,
  useRiskFlag,
  useRunRules,
  useCreateFlag,
  useActOnFlag,
} from "@/hooks/useFraud";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const TABS = [
  { key: "Flags", icon: Flag },
  { key: "Risk Radar", icon: Radar },
];

const severityTone = { high: "destructive", medium: "default", low: "secondary", none: "outline" };
const statusTone = {
  open: "default",
  reviewing: "secondary",
  dismissed: "outline",
  actioned: "destructive",
};
const typeLabel = {
  cancel_abuse: "Cancel abuse",
  payment_failures: "Payment failures",
  refund_abuse: "Refund abuse",
  velocity: "Velocity",
  chargeback_risk: "Chargeback risk",
  manual: "Manual",
};

const toastErr = (toast) => (e) =>
  toast({ title: e?.response?.data?.message || "Action failed", variant: "destructive" });

const Stat = ({ label, value, tone = "" }) => (
  <Card>
    <CardContent className="p-3">
      <p className="text-xs text-stone-400 uppercase">{label}</p>
      <p className={`text-xl font-bold ${tone}`}>{value}</p>
    </CardContent>
  </Card>
);

// --- Flag triage dialog -----------------------------------------------------
const FlagDialog = ({ flagId, open, onClose }) => {
  const { data: f, isLoading } = useRiskFlag(open ? flagId : null);
  const act = useActOnFlag();
  const { toast } = useToast();
  const [note, setNote] = useState("");

  const run = (action, block = false) =>
    act.mutate(
      { id: flagId, data: { action, note: note || undefined, block } },
      {
        onSuccess: (r) =>
          toast({
            title:
              action === "dismiss"
                ? "Flag dismissed"
                : action === "review"
                  ? "Marked reviewing"
                  : r?.data?.data?.blocked
                    ? "Account blocked"
                    : "Flag actioned",
          }),
        onError: toastErr(toast),
      },
    );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Risk flag</DialogTitle>
        </DialogHeader>
        {isLoading || !f ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <Badge variant={severityTone[f.severity]}>{f.severity}</Badge>
              <Badge variant="outline">{typeLabel[f.type] || f.type}</Badge>
              <Badge variant={statusTone[f.status]}>{f.status}</Badge>
              {f.score > 0 && <span className="text-stone-400">score {f.score}</span>}
            </div>

            <div className="rounded-md bg-stone-50 dark:bg-stone-900 p-3 text-sm space-y-1">
              <p className="font-medium">
                {f.customer?.name || "Customer"}{" "}
                {f.customer?.isBlocked && (
                  <Badge variant="destructive" className="ml-1">
                    blocked
                  </Badge>
                )}
              </p>
              <p className="text-stone-400 text-xs">
                {f.customer?.email} · {f.customer?.phone || "no phone"}
              </p>
              <p className="pt-1">{f.reason}</p>
            </div>

            {f.signals && Object.keys(f.signals).length > 0 && (
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(f.signals).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-md border border-stone-100 dark:border-stone-800 p-2"
                  >
                    <p className="text-sm font-bold">{v}</p>
                    <p className="text-[10px] text-stone-400 uppercase">{k}</p>
                  </div>
                ))}
              </div>
            )}

            {f.note && <p className="text-sm text-stone-500 italic">Note: {f.note}</p>}

            {["dismissed", "actioned"].includes(f.status) ? (
              <p className="text-sm text-stone-400">
                Resolved {f.resolvedAt ? formatDate(f.resolvedAt) : ""}
              </p>
            ) : (
              <div className="space-y-2">
                <textarea
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-sm"
                  placeholder="Triage note (optional)…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => run("review")}
                    disabled={act.isPending}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Reviewing
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => run("dismiss")}
                    disabled={act.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" /> Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-auto"
                    onClick={() => run("action", true)}
                    disabled={act.isPending || f.customer?.isBlocked}
                  >
                    <Ban className="h-4 w-4 mr-1" /> Action + block
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Flags tab --------------------------------------------------------------
const FlagsTab = () => {
  const [status, setStatus] = useState("open");
  const [openId, setOpenId] = useState(null);
  const { data: flags, isLoading } = useRiskFlags(status === "all" ? {} : { status });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="actioned">Actioned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !flags?.length ? (
        <EmptyState icon="🛡️" title="No flags" />
      ) : (
        flags.map((f) => (
          <Card
            key={f._id}
            className="cursor-pointer hover:border-teal-300"
            onClick={() => setOpenId(f._id)}
          >
            <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{f.customer?.name || "Customer"}</p>
                  {f.customer?.isBlocked && <Ban className="h-4 w-4 text-red-500" />}
                  <Badge variant="outline">{typeLabel[f.type] || f.type}</Badge>
                </div>
                <p className="text-xs text-stone-400 truncate">
                  {f.reason || f.customer?.email} · {formatDate(f.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {f.score > 0 && <span className="text-xs text-stone-400">{f.score}</span>}
                <Badge variant={severityTone[f.severity]}>{f.severity}</Badge>
                <Badge variant={statusTone[f.status]}>{f.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <FlagDialog flagId={openId} open={!!openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

// --- Risk Radar tab ---------------------------------------------------------
const RadarTab = () => {
  const { data: customers, isLoading } = useRiskyCustomers({ min: 20, limit: 25 });
  const runRules = useRunRules();
  const createFlag = useCreateFlag();
  const { toast } = useToast();

  const scan = () =>
    runRules.mutate(undefined, {
      onSuccess: (r) => {
        const d = r?.data?.data;
        toast({ title: `Scanned ${d?.evaluated ?? 0} customers — ${d?.created ?? 0} new flag(s)` });
      },
      onError: toastErr(toast),
    });

  const raise = (c) =>
    createFlag.mutate(
      {
        customer: c.customer?._id,
        type: c.type,
        severity: c.severity,
        score: c.score,
        reason: (c.reasons || []).join("; "),
      },
      {
        onSuccess: () => toast({ title: "Flag raised" }),
        onError: toastErr(toast),
      },
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-stone-400">
          Live-computed risk scores. Run the rules engine to raise flags automatically.
        </p>
        <Button size="sm" onClick={scan} disabled={runRules.isPending}>
          <Play className="h-4 w-4 mr-1" /> Run rules engine
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !customers?.length ? (
        <EmptyState
          icon="✅"
          title="No risky customers"
          description="Nothing above the score threshold."
        />
      ) : (
        customers.map((c) => (
          <Card key={c.customer?._id}>
            <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{c.customer?.name || "Customer"}</p>
                  <Badge variant="outline">{typeLabel[c.type] || c.type}</Badge>
                </div>
                <p className="text-xs text-stone-400 truncate">{(c.reasons || []).join(" · ")}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold">{c.score}</p>
                  <Badge variant={severityTone[c.severity]}>{c.severity}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => raise(c)}
                  disabled={createFlag.isPending}
                >
                  <Flag className="h-4 w-4 mr-1" /> Flag
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// --- Page shell -------------------------------------------------------------
const AdminFraud = () => {
  const [tab, setTab] = useState("Flags");
  const { data: ov } = useRiskOverview();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Fraud &amp; Risk</h1>
      </div>

      {ov && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Open flags" value={ov.openFlags} tone="text-amber-600" />
          <Stat label="High severity" value={ov.openBySeverity?.high || 0} tone="text-red-500" />
          <Stat label="Actioned" value={ov.flagsByStatus?.actioned || 0} />
          <Stat label="Dismissed" value={ov.flagsByStatus?.dismissed || 0} />
        </div>
      )}

      <div className="flex gap-1 border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px flex items-center gap-1.5 transition-colors ${
              tab === key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Icon className="h-4 w-4" />
            {key}
          </button>
        ))}
      </div>

      {tab === "Flags" && <FlagsTab />}
      {tab === "Risk Radar" && <RadarTab />}
    </div>
  );
};

export default AdminFraud;
