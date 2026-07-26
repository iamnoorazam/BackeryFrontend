import { useState } from "react";
import {
  Megaphone,
  Send,
  Trash2,
  Plus,
  FileText,
  Users,
  Radio,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useNcOverview,
  useNcChannels,
  useNcTemplates,
  useNcCampaigns,
  useNcCampaign,
  useCreateTemplate,
  useDeleteTemplate,
  useCreateCampaign,
  useDeleteCampaign,
  useSendCampaign,
  usePreviewAudience,
} from "@/hooks/useNotificationCenter";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const TABS = [
  { key: "Campaigns", icon: Radio },
  { key: "Templates", icon: FileText },
];

const ROLES = ["customer", "delivery", "staff", "admin"];
const statusTone = {
  draft: "secondary",
  scheduled: "outline",
  sending: "default",
  sent: "default",
  failed: "destructive",
};
const deliveryTone = {
  sent: "default",
  simulated: "secondary",
  skipped: "outline",
  failed: "destructive",
};

const toastErr = (toast) => (e) =>
  toast({ title: e?.response?.data?.message || "Action failed", variant: "destructive" });

// --- Campaign detail (delivery logs) ---------------------------------------
const CampaignDialog = ({ campaignId, open, onClose }) => {
  const { data: c, isLoading } = useNcCampaign(open ? campaignId : null);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{c?.title || "Campaign"}</DialogTitle>
        </DialogHeader>
        {isLoading || !c ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <Badge variant={statusTone[c.status]}>{c.status}</Badge>
              <Badge variant="outline">{c.channel}</Badge>
              <span className="text-stone-400">
                targeted {c.stats?.targeted ?? 0} · sent {c.stats?.sent ?? 0} · failed{" "}
                {c.stats?.failed ?? 0}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap rounded-md bg-stone-50 dark:bg-stone-900 p-3">
              {c.body}
            </p>
            <div>
              <p className="text-xs uppercase text-stone-400 mb-2">
                Delivery log ({c.logs?.length || 0})
              </p>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {!c.logs?.length ? (
                  <p className="text-sm text-stone-400">No deliveries recorded.</p>
                ) : (
                  c.logs.map((l) => (
                    <div
                      key={l._id}
                      className="flex items-center justify-between gap-2 text-sm border-b border-stone-100 dark:border-stone-800 py-1"
                    >
                      <span className="truncate">
                        {l.recipient?.name || l.recipient?.email || "user"}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {l.detail && <span className="text-xs text-stone-400">{l.detail}</span>}
                        <Badge variant={deliveryTone[l.status] || "outline"}>{l.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Campaigns tab ----------------------------------------------------------
const CampaignsTab = () => {
  const { data: campaigns, isLoading } = useNcCampaigns();
  const { data: channels = ["inapp"] } = useNcChannels();
  const create = useCreateCampaign();
  const del = useDeleteCampaign();
  const send = useSendCampaign();
  const preview = usePreviewAudience();
  const { toast } = useToast();
  const [openId, setOpenId] = useState(null);
  const [reach, setReach] = useState(null);
  const [form, setForm] = useState({
    title: "",
    channel: "inapp",
    subject: "",
    body: "",
    audienceType: "all",
    role: "customer",
  });

  const buildAudience = () =>
    form.audienceType === "role" ? { type: "role", role: form.role } : { type: form.audienceType };

  const checkReach = () =>
    preview.mutate(buildAudience(), {
      onSuccess: (d) => setReach(d.targeted),
      onError: toastErr(toast),
    });

  const add = (e) => {
    e.preventDefault();
    if (!form.title || !form.body)
      return toast({ title: "Title and body are required", variant: "destructive" });
    create.mutate(
      {
        title: form.title,
        channel: form.channel,
        subject: form.subject,
        body: form.body,
        audience: buildAudience(),
      },
      {
        onSuccess: () => {
          toast({ title: "Campaign drafted" });
          setForm({ ...form, title: "", subject: "", body: "" });
          setReach(null);
        },
        onError: toastErr(toast),
      },
    );
  };

  const dispatch = (id) =>
    send.mutate(id, {
      onSuccess: (r) => {
        const s = r?.data?.data?.stats;
        toast({ title: `Sent — ${s?.sent ?? 0} delivered, ${s?.failed ?? 0} failed` });
      },
      onError: toastErr(toast),
    });

  return (
    <div className="space-y-4">
      {/* Composer */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={add} className="space-y-3">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Input
                placeholder="Campaign title (internal)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger className="w-40 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(form.channel === "email" || form.channel === "inapp") && (
              <Input
                placeholder="Subject / title (supports {{name}})"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            )}
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background p-2 text-sm"
              placeholder="Message body — supports {{name}}, {{email}}, {{role}}"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
            <div className="flex gap-2 flex-wrap items-center">
              <Select
                value={form.audienceType}
                onValueChange={(v) => {
                  setForm({ ...form, audienceType: v });
                  setReach(null);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="role">By role</SelectItem>
                </SelectContent>
              </Select>
              {form.audienceType === "role" && (
                <Select
                  value={form.role}
                  onValueChange={(v) => {
                    setForm({ ...form, role: v });
                    setReach(null);
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button type="button" variant="outline" size="sm" onClick={checkReach}>
                <Users className="h-4 w-4 mr-1" />
                {reach == null ? "Check reach" : `${reach} recipients`}
              </Button>
              <Button type="submit" className="ml-auto" disabled={create.isPending}>
                <Plus className="h-4 w-4 mr-1" />
                Draft campaign
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Campaign list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !campaigns?.length ? (
        <EmptyState icon="📣" title="No campaigns yet" />
      ) : (
        campaigns.map((c) => (
          <Card key={c._id}>
            <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
              <button className="min-w-0 text-left" onClick={() => setOpenId(c._id)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{c.title}</p>
                  <Badge variant="outline">{c.channel}</Badge>
                  <Badge variant={statusTone[c.status]}>{c.status}</Badge>
                </div>
                <p className="text-xs text-stone-400">
                  {c.audience?.type === "role"
                    ? `role: ${c.audience.role}`
                    : c.audience?.type || "all"}
                  {c.stats?.targeted ? ` · ${c.stats.sent}/${c.stats.targeted} sent` : ""} ·{" "}
                  {formatDate(c.createdAt)}
                </p>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                {["draft", "scheduled", "failed"].includes(c.status) && (
                  <Button size="sm" onClick={() => dispatch(c._id)} disabled={send.isPending}>
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                )}
                {c.status === "sent" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {c.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                {c.status !== "sending" && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-destructive h-8 w-8"
                    onClick={() => del.mutate(c._id, { onError: toastErr(toast) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <CampaignDialog campaignId={openId} open={!!openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

// --- Templates tab ----------------------------------------------------------
const TemplatesTab = () => {
  const { data, isLoading } = useNcTemplates();
  const { data: channels = ["inapp"] } = useNcChannels();
  const create = useCreateTemplate();
  const del = useDeleteTemplate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", channel: "inapp", subject: "", body: "" });

  const add = (e) => {
    e.preventDefault();
    if (!form.name || !form.body)
      return toast({ title: "Name and body are required", variant: "destructive" });
    create.mutate(form, {
      onSuccess: () => {
        toast({ title: "Template saved" });
        setForm({ name: "", channel: "inapp", subject: "", body: "" });
      },
      onError: toastErr(toast),
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={add} className="space-y-3">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Input
                placeholder="Template name (unique)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger className="w-40 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Subject (email/in-app)"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              className="w-full min-h-[70px] rounded-md border border-input bg-background p-2 text-sm"
              placeholder="Body — supports {{name}} placeholders"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={create.isPending}>
                <Plus className="h-4 w-4 mr-1" />
                Save template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!data?.length ? (
        <EmptyState icon="📝" title="No templates" />
      ) : (
        data.map((t) => (
          <Card key={t._id}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{t.name}</p>
                  <Badge variant="outline">{t.channel}</Badge>
                  {!t.isActive && <Badge variant="secondary">off</Badge>}
                </div>
                <p className="text-xs text-stone-400 truncate">{t.subject || t.body}</p>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="text-destructive h-8 w-8 shrink-0"
                onClick={() => del.mutate(t._id, { onError: toastErr(toast) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// --- Page shell -------------------------------------------------------------
const Stat = ({ label, value, tone = "" }) => (
  <Card>
    <CardContent className="p-3">
      <p className="text-xs text-stone-400 uppercase">{label}</p>
      <p className={`text-xl font-bold ${tone}`}>{value}</p>
    </CardContent>
  </Card>
);

const AdminNotifications = () => {
  const [tab, setTab] = useState("Campaigns");
  const { data: ov } = useNcOverview();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Megaphone className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Notification Center</h1>
      </div>

      {ov && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Campaigns" value={ov.campaigns} />
          <Stat label="Templates" value={ov.templates} />
          <Stat label="Delivered" value={ov.deliveriesByStatus?.sent || 0} tone="text-green-600" />
          <Stat label="Failed" value={ov.deliveriesByStatus?.failed || 0} tone="text-red-500" />
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

      {tab === "Campaigns" && <CampaignsTab />}
      {tab === "Templates" && <TemplatesTab />}
    </div>
  );
};

export default AdminNotifications;
