import { useState } from "react";
import { ShieldAlert, AlertTriangle, MapPin, CheckCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useAdminSafetyAlerts, useResolveSafetyAlert } from "@/hooks/useSafety";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const STATUS_BADGE = { open: "destructive", acknowledged: "default", resolved: "outline" };

const AdminSafety = () => {
  const [status, setStatus] = useState("open");
  const { data: alerts, isLoading } = useAdminSafetyAlerts(status === "all" ? undefined : status);
  const resolve = useResolveSafetyAlert();
  const { toast } = useToast();

  const act = (id, action) => {
    let note;
    if (action === "resolve") {
      note = window.prompt("Resolution note (optional):") || "";
    }
    resolve.mutate(
      { id, action, note },
      {
        onSuccess: () => toast({ title: `Alert ${action}d` }),
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
      },
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Safety alerts ({alerts?.length ?? 0})</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!alerts?.length ? (
        <EmptyState icon="🛟" title="No safety alerts" />
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => {
            const isSos = a.type === "sos";
            return (
              <Card key={a._id} className={isSos && a.status === "open" ? "border-red-300" : ""}>
                <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                  <div
                    className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${isSos ? "bg-red-100" : "bg-amber-100"}`}
                  >
                    {isSos ? (
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{isSos ? "SOS" : "Incident"}</p>
                      <Badge variant={STATUS_BADGE[a.status] || "secondary"}>{a.status}</Badge>
                      {a.category && !isSos && (
                        <span className="text-[10px] uppercase text-stone-400">{a.category}</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 truncate">
                      {a.partner?.name || a.user?.name} · {a.partner?.phone || a.user?.phone} ·{" "}
                      {formatDate(a.createdAt)}
                    </p>
                    {a.description && (
                      <p className="text-xs text-stone-500 mt-0.5">{a.description}</p>
                    )}
                    {a.location?.lat != null && (
                      <a
                        href={`https://maps.google.com/?q=${a.location.lat},${a.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5"
                      >
                        <MapPin className="h-3 w-3" /> View location
                      </a>
                    )}
                  </div>
                  {a.status !== "resolved" && (
                    <div className="flex items-center gap-2">
                      {a.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => act(a._id, "acknowledge")}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Acknowledge
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => act(a._id, "resolve")}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSafety;
