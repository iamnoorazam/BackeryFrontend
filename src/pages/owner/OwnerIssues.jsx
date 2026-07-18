import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useIssues, useIssueStats, useUpdateIssueStatus } from "@/hooks/useIssues";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Phone, Mail, Clock, CheckCircle, Loader2 } from "lucide-react";

const STATUS_COLORS = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

const ISSUE_TYPE_LABELS = {
  payment: "Payment",
  delivery: "Delivery",
  product: "Product",
  app: "App/Website",
  other: "Other",
};

const IssueDetail = ({ issue, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await onStatusChange({ id: issue._id, status });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Customer</p>
          <p className="font-medium">{issue.customerName || issue.customer?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Date</p>
          <p className="font-medium">{formatDate(issue.createdAt)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Issue Type</p>
          <Badge variant="secondary">{ISSUE_TYPE_LABELS[issue.issueType] || issue.issueType}</Badge>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[issue.status]}`}>
            {issue.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {(issue.customerPhone || issue.customer?.phone) && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Contact</p>
          <div className="flex gap-3">
            <a
              href={`tel:${issue.customerPhone || issue.customer?.phone}`}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Phone className="h-3.5 w-3.5" /> {issue.customerPhone || issue.customer?.phone}
            </a>
            {issue.customerEmail && (
              <a
                href={`mailto:${issue.customerEmail}`}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
          </div>
        </div>
      )}

      <Separator />

      <div>
        <p className="text-sm text-muted-foreground mb-1">Issue Description</p>
        <p className="text-sm bg-stone-50 rounded-lg p-3 border border-stone-200 whitespace-pre-wrap">
          {issue.description}
        </p>
      </div>

      <Separator />

      <div>
        <p className="text-sm text-muted-foreground mb-2">Update Status</p>
        <div className="flex gap-2">
          {["open", "in_progress", "resolved"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={issue.status === s ? "default" : "outline"}
              onClick={() => handleStatusChange(s)}
              disabled={updating || issue.status === s}
              className={
                s === "open" ? "border-red-300 text-red-700 hover:bg-red-50" :
                s === "in_progress" ? "border-yellow-300 text-yellow-700 hover:bg-yellow-50" :
                "border-green-300 text-green-700 hover:bg-green-50"
              }
            >
              {updating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              {s === "open" ? "Open" : s === "in_progress" ? "In Progress" : "Resolved"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

const OwnerIssues = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: issues, isLoading } = useIssues(statusFilter || undefined);
  const { data: stats } = useIssueStats();
  const updateStatus = useUpdateIssueStatus();
  const [selectedIssue, setSelectedIssue] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Customer Issues</h1>
        <div className="flex items-center gap-2">
          {stats && (
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {stats.open} open
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                {stats.inProgress} in progress
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {stats.resolved} resolved
              </Badge>
            </div>
          )}
          <Select onValueChange={(v) => setStatusFilter(v)} value={statusFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All issues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All issues</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !issues?.length ? (
        <EmptyState icon="✅" title="No issues reported" description="All clear! No customer issues at the moment." />
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <Card key={issue._id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">
                        {ISSUE_TYPE_LABELS[issue.issueType] || issue.issueType}
                      </Badge>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[issue.status]}`}>
                        {issue.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="font-semibold mt-1 flex items-center gap-2">
                      {issue.customerName || issue.customer?.name || "Unknown"}
                    </p>
                    {(issue.customerPhone || issue.customer?.phone) && (
                      <a
                        href={`tel:${issue.customerPhone || issue.customer?.phone}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="h-3 w-3" /> {issue.customerPhone || issue.customer?.phone}
                      </a>
                    )}
                    <p className="text-sm text-stone-600 mt-1 line-clamp-2">{issue.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDate(issue.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedIssue(issue)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Issue Details
                          </DialogTitle>
                        </DialogHeader>
                        <IssueDetail
                          issue={issue}
                          onStatusChange={(d) => updateStatus.mutate(d)}
                        />
                      </DialogContent>
                    </Dialog>

                    {issue.customerPhone && (
                      <a href={`tel:${issue.customerPhone}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> Call
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerIssues;
