import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/store/Toast";
import { useCreateIssue } from "@/hooks/useIssues";
import { AlertTriangle, Bug } from "lucide-react";

const CheckoutIssueButton = ({ orderId, userName, customerPhone, customerEmail, defaultIssueType, defaultDescription, buttonLabel, buttonClassName }) => {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState(defaultIssueType || "other");
  const [description, setDescription] = useState(defaultDescription || "");
  const createIssue = useCreateIssue();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: "Please describe the issue", variant: "destructive" });
      return;
    }
    try {
      await createIssue.mutateAsync({
        orderId: orderId || undefined,
        issueType,
        description: description.trim(),
        customerName: userName || "",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
      });
      toast({ title: "Issue reported! We'll contact you soon." });
      setOpen(false);
      setDescription(defaultDescription || "");
      setIssueType(defaultIssueType || "other");
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Failed to report issue",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className={buttonClassName || "w-full border-danger/30 text-danger hover:bg-danger-subtle gap-1.5"}>
          <Bug className="h-3.5 w-3.5" /> {buttonLabel || "Report an Issue"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" /> Report an Issue
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-xs sm:text-sm font-medium">Issue Type</Label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-danger"
            >
              <option value="payment">Payment Issue</option>
              <option value="delivery">Delivery Issue</option>
              <option value="product">Product Issue</option>
              <option value="app">App/Website Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs sm:text-sm font-medium">
              Describe the issue <span className="text-danger">*</span>
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what went wrong..."
              rows={4}
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-danger resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-danger hover:opacity-90 text-white"
            disabled={createIssue.isPending}
          >
            {createIssue.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutIssueButton;
