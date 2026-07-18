import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Bike,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Ban,
  RotateCcw,
} from "lucide-react";
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
import {
  useAdminDeliveryPartners,
  useApproveDeliveryPartner,
  useRejectDeliveryPartner,
  useSetDeliveryPartnerStatus,
} from "@/hooks/useAdmin";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const STATUS_BADGE = {
  draft: "secondary",
  pending: "default",
  approved: "outline",
  rejected: "destructive",
  suspended: "destructive",
  blocked: "destructive",
};

const AdminDeliveryPartners = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState(null);
  const { data: partners, isLoading } = useAdminDeliveryPartners(
    statusFilter === "all" ? undefined : statusFilter,
  );
  const approve = useApproveDeliveryPartner();
  const reject = useRejectDeliveryPartner();
  const setStatus = useSetDeliveryPartnerStatus();
  const { toast } = useToast();

  const handleApprove = (id) =>
    approve.mutate(id, {
      onSuccess: () => toast({ title: "Partner approved & active" }),
      onError: () => toast({ title: "Approve failed", variant: "destructive" }),
    });

  const handleReject = (id) => {
    const reason = window.prompt("Reason for requesting changes (shown to the rider):");
    if (!reason || !reason.trim()) return;
    reject.mutate(
      { id, reason: reason.trim() },
      {
        onSuccess: () => toast({ title: "Changes requested" }),
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Reject failed", variant: "destructive" }),
      },
    );
  };

  const handleStatus = (id, action) =>
    setStatus.mutate(
      { id, action },
      {
        onSuccess: () => toast({ title: `Partner ${action}d` }),
        onError: (err) =>
          toast({ title: err.response?.data?.message || "Action failed", variant: "destructive" }),
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery Partners ({partners?.length ?? 0})</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!partners?.length ? (
        <EmptyState icon="🛵" title="No delivery partners in this state" />
      ) : (
        <div className="space-y-2">
          {partners.map((p) => (
            <Card key={p._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 grid place-items-center shrink-0">
                      {p.profilePhoto ? (
                        <img
                          src={p.profilePhoto}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <Bike className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {p.name}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          · {p.vehicle?.type || "—"}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground mt-0.5">
                        {p.user?.email && (
                          <a
                            href={`mailto:${p.user.email}`}
                            className="flex items-center gap-1 hover:text-teal-600"
                          >
                            <Mail className="h-3 w-3" /> {p.user.email}
                          </a>
                        )}
                        {p.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {p.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {p.submittedAt
                          ? `Submitted ${formatDate(p.submittedAt)}`
                          : `Created ${formatDate(p.createdAt)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_BADGE[p.verificationStatus] || "secondary"}>
                      {p.verificationStatus}
                    </Badge>
                    {p.verificationStatus === "pending" && (
                      <>
                        <Button size="sm" className="h-8" onClick={() => handleApprove(p._id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => handleReject(p._id)}
                        >
                          <XCircle className="h-4 w-4 mr-1 text-red-500" /> Request changes
                        </Button>
                      </>
                    )}
                    {p.verificationStatus === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleStatus(p._id, "suspend")}
                      >
                        <Ban className="h-4 w-4 mr-1 text-orange-500" /> Suspend
                      </Button>
                    )}
                    {(p.verificationStatus === "suspended" ||
                      p.verificationStatus === "blocked") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleStatus(p._id, "reactivate")}
                      >
                        <RotateCcw className="h-4 w-4 mr-1 text-emerald-500" /> Reactivate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                    >
                      {expandedId === p._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Details
                    </Button>
                  </div>
                </div>

                {expandedId === p._id && (
                  <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-600">
                    <Detail label="PAN" value={p.kyc?.pan} />
                    <Detail label="Aadhaar" value={p.kyc?.aadhaar} />
                    <Detail label="Driving license" value={p.kyc?.drivingLicense} />
                    <Detail label="Vehicle reg" value={p.vehicle?.registrationNumber} />
                    <Detail label="RC number" value={p.vehicle?.rcNumber} />
                    <Detail label="Insurance" value={p.vehicle?.insuranceNumber} />
                    <Detail label="Bank a/c" value={p.bank?.accountNumber} />
                    <Detail label="IFSC" value={p.bank?.ifsc} />
                    <Detail
                      label="Address"
                      value={[
                        p.address?.line1,
                        p.address?.city,
                        p.address?.state,
                        p.address?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    {p.verificationStatus === "rejected" && (
                      <Detail label="Reject reason" value={p.rejectionReason} />
                    )}
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

const Detail = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="font-semibold text-stone-500">{label}:</span>
    <span className="truncate">{value || "—"}</span>
  </div>
);

export default AdminDeliveryPartners;
