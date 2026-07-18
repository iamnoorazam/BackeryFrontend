import { useState } from "react";
import { CheckCircle, XCircle, Banknote } from "lucide-react";
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
import { useAdminPayouts, useProcessPayout } from "@/hooks/usePayouts";
import { useToast } from "../../store/Toast";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_BADGE = {
  requested: "default",
  approved: "secondary",
  paid: "outline",
  rejected: "destructive",
};

const AdminPayouts = () => {
  const [status, setStatus] = useState("requested");
  const { data: payouts, isLoading } = useAdminPayouts(status === "all" ? undefined : status);
  const process = useProcessPayout();
  const { toast } = useToast();

  const act = (id, action) => {
    let note;
    if (action === "reject") {
      note = window.prompt("Reason for rejection:");
      if (note === null) return;
    }
    process.mutate(
      { id, action, note },
      {
        onSuccess: () =>
          toast({ title: `Payout ${action === "pay" ? "marked paid" : `${action}d`}` }),
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
        <h1 className="text-2xl font-bold">Payouts ({payouts?.length ?? 0})</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!payouts?.length ? (
        <EmptyState icon="💸" title="No payout requests" />
      ) : (
        <div className="space-y-2">
          {payouts.map((p) => (
            <Card key={p._id}>
              <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 grid place-items-center shrink-0">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{formatPrice(p.amount)}</p>
                    <Badge variant={STATUS_BADGE[p.status] || "secondary"}>{p.status}</Badge>
                  </div>
                  <p className="text-xs text-stone-500 truncate">
                    {p.vendor?.name} · {p.owner?.name} ({p.owner?.email}) ·{" "}
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                {(p.status === "requested" || p.status === "approved") && (
                  <div className="flex items-center gap-2">
                    {p.status === "requested" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => act(p._id, "approve")}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="h-8 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => act(p._id, "pay")}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-red-300 text-red-600"
                      onClick={() => act(p._id, "reject")}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
