import { useState } from "react";
import { LifeBuoy, AlertTriangle, Send, Lock, ArrowUpCircle } from "lucide-react";
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
  useSupportAnalytics,
  useSupportTickets,
  useSupportTicket,
  useReplyTicket,
  useUpdateTicket,
} from "@/hooks/useSupport";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const priorityTone = {
  low: "secondary",
  normal: "outline",
  high: "default",
  urgent: "destructive",
};
const statusTone = {
  open: "default",
  pending: "secondary",
  in_progress: "default",
  resolved: "secondary",
  closed: "outline",
};
const STATUSES = ["open", "pending", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

const TicketDialog = ({ ticketId, open, onClose }) => {
  const { data: t, isLoading } = useSupportTicket(open ? ticketId : null);
  const reply = useReplyTicket();
  const update = useUpdateTicket();
  const { toast } = useToast();
  const [msg, setMsg] = useState("");
  const [internal, setInternal] = useState(false);

  const send = () => {
    if (!msg.trim()) return;
    reply.mutate(
      { id: ticketId, body: msg, isInternal: internal },
      {
        onSuccess: () => {
          setMsg("");
          toast({ title: internal ? "Note added" : "Reply sent" });
        },
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      },
    );
  };

  const setField = (data) =>
    update.mutate(
      { id: ticketId, data },
      { onError: () => toast({ title: "Update failed", variant: "destructive" }) },
    );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t?.subject || "Ticket"}</DialogTitle>
        </DialogHeader>
        {isLoading || !t ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <Badge variant={statusTone[t.status]}>{t.status}</Badge>
              <Badge variant={priorityTone[t.priority]}>{t.priority}</Badge>
              {t.escalated && <Badge variant="destructive">escalated</Badge>}
              <span className="text-stone-400">
                {t.requester?.name} ({t.requester?.role})
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={t.status} onValueChange={(v) => setField({ status: v })}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={t.priority} onValueChange={(v) => setField({ priority: v })}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!t.escalated && (
                <Button size="sm" variant="outline" onClick={() => setField({ escalated: true })}>
                  <ArrowUpCircle className="h-4 w-4 mr-1" /> Escalate
                </Button>
              )}
            </div>

            {/* Conversation */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {t.messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    m.isInternal
                      ? "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900"
                      : m.authorRole === "support"
                        ? "bg-teal-50 dark:bg-teal-950"
                        : "bg-stone-50 dark:bg-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
                    <span className="font-medium">{m.authorName || m.authorRole || "user"}</span>
                    {m.isInternal && (
                      <Badge variant="outline" className="text-[10px]">
                        <Lock className="h-3 w-3 mr-0.5" /> internal
                      </Badge>
                    )}
                    <span>{formatDate(m.at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="space-y-2">
              <textarea
                className="w-full min-h-[70px] rounded-md border border-input bg-background p-2 text-sm"
                placeholder={internal ? "Internal note (staff only)…" : "Reply to requester…"}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm text-stone-500">
                  <input
                    type="checkbox"
                    checked={internal}
                    onChange={(e) => setInternal(e.target.checked)}
                  />
                  Internal note
                </label>
                <Button size="sm" onClick={send} disabled={reply.isPending}>
                  <Send className="h-4 w-4 mr-1" /> Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AdminSupport = () => {
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState(null);
  const { data: analytics } = useSupportAnalytics();
  const { data: tickets, isLoading } = useSupportTickets(status === "all" ? {} : { status });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold">Support</h1>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-stone-400 uppercase">Open</p>
              <p className="text-xl font-bold text-amber-600">{analytics.openCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-stone-400 uppercase">Resolved</p>
              <p className="text-xl font-bold text-green-600">{analytics.resolvedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-stone-400 uppercase">Urgent</p>
              <p className="text-xl font-bold text-red-500">{analytics.priority?.urgent || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-stone-400 uppercase">Avg resolve</p>
              <p className="text-xl font-bold">{analytics.avgResolutionHours}h</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !tickets?.length ? (
        <EmptyState icon="🎫" title="No tickets" />
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Card
              key={t._id}
              className="cursor-pointer hover:border-teal-300"
              onClick={() => setOpenId(t._id)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{t.subject}</p>
                    {t.escalated && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                  <p className="text-xs text-stone-400">
                    {t.requester?.name || "user"} ({t.requester?.role}) · {formatDate(t.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={priorityTone[t.priority]}>{t.priority}</Badge>
                  <Badge variant={statusTone[t.status]}>{t.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TicketDialog ticketId={openId} open={!!openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

export default AdminSupport;
