import { useState } from "react";
import { CheckCircle, XCircle, Store, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
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
import { useAdminVendors, useApproveVendor, useRejectVendor } from "@/hooks/useAdmin";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const STATUS_BADGE = {
  draft: "secondary",
  pending: "default",
  approved: "outline",
  rejected: "destructive",
};

const AdminVendors = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState(null);
  const { data: vendors, isLoading } = useAdminVendors(
    statusFilter === "all" ? undefined : statusFilter,
  );
  const approve = useApproveVendor();
  const reject = useRejectVendor();
  const { toast } = useToast();

  const handleApprove = (id) =>
    approve.mutate(id, {
      onSuccess: () => toast({ title: "Store approved & live" }),
      onError: () => toast({ title: "Approve failed", variant: "destructive" }),
    });

  const handleReject = (id) => {
    const reason = window.prompt("Reason for requesting changes (shown to the merchant):");
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

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Merchants ({vendors?.length ?? 0})</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!vendors?.length ? (
        <EmptyState icon="🏪" title="No merchants in this state" />
      ) : (
        <div className="space-y-2">
          {vendors.map((v) => (
            <Card key={v._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 grid place-items-center shrink-0">
                      {v.logo ? (
                        <img src={v.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <Store className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{v.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground mt-0.5">
                        <span>{v.owner?.name}</span>
                        {v.owner?.email && (
                          <a
                            href={`mailto:${v.owner.email}`}
                            className="flex items-center gap-1 hover:text-indigo-600"
                          >
                            <Mail className="h-3 w-3" /> {v.owner.email}
                          </a>
                        )}
                        {v.owner?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {v.owner.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {v.submittedAt
                          ? `Submitted ${formatDate(v.submittedAt)}`
                          : `Created ${formatDate(v.createdAt)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_BADGE[v.verificationStatus] || "secondary"}>
                      {v.verificationStatus}
                    </Badge>
                    {v.verificationStatus === "pending" && (
                      <>
                        <Button size="sm" className="h-8" onClick={() => handleApprove(v._id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => handleReject(v._id)}
                        >
                          <XCircle className="h-4 w-4 mr-1 text-red-500" /> Request changes
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => setExpandedId(expandedId === v._id ? null : v._id)}
                    >
                      {expandedId === v._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Details
                    </Button>
                  </div>
                </div>

                {expandedId === v._id && (
                  <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-600">
                    <Detail label="Business type" value={v.kyc?.businessType} />
                    <Detail label="PAN" value={v.kyc?.pan} />
                    <Detail label="GST" value={v.kyc?.gstNumber} />
                    <Detail label="FSSAI" value={v.kyc?.fssaiLicense} />
                    <Detail label="Bank a/c" value={v.bank?.accountNumber} />
                    <Detail label="IFSC" value={v.bank?.ifsc} />
                    <Detail
                      label="Address"
                      value={[
                        v.address?.line1,
                        v.address?.city,
                        v.address?.state,
                        v.address?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    {v.verificationStatus === "rejected" && (
                      <Detail label="Reject reason" value={v.rejectionReason} />
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

export default AdminVendors;
