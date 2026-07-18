import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Store, CheckCircle2, Clock, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyStore, useUpdateMyStore, useSubmitForReview } from "@/hooks/useMerchant";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";

const STATUS_META = {
  draft: { label: "Draft", icon: AlertCircle, cls: "bg-stone-100 text-stone-600" },
  pending: { label: "Under review", icon: Clock, cls: "bg-amber-100 text-amber-700" },
  approved: {
    label: "Approved · Live",
    icon: CheckCircle2,
    cls: "bg-emerald-100 text-emerald-700",
  },
  rejected: { label: "Changes requested", icon: AlertCircle, cls: "bg-red-100 text-red-700" },
};

const emptyForm = {
  description: "",
  kyc: { businessType: "", gstNumber: "", fssaiLicense: "", pan: "", aadhaar: "" },
  bank: { accountHolder: "", accountNumber: "", ifsc: "" },
  address: { line1: "", line2: "", city: "", state: "", pincode: "" },
};

const MerchantOnboarding = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const { data: store, isLoading } = useMyStore();
  const updateStore = useUpdateMyStore();
  const submitReview = useSubmitForReview();

  const [form, setForm] = useState(emptyForm);

  // Seed the editable form from the loaded store.
  useEffect(() => {
    if (!store) return;
    setForm({
      description: store.description || "",
      kyc: { ...emptyForm.kyc, ...(store.kyc || {}) },
      bank: { ...emptyForm.bank, ...(store.bank || {}) },
      address: { ...emptyForm.address, ...(store.address || {}) },
    });
  }, [store]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D2691E]" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="text-stone-600">No store found for this account.</p>
          <Link to="/merchant/register" className="text-[#D2691E] font-semibold hover:underline">
            Register a store
          </Link>
        </div>
      </div>
    );
  }

  const status = store.verificationStatus || "draft";
  const editable = status === "draft" || status === "rejected";
  const meta = STATUS_META[status] || STATUS_META.draft;
  const StatusIcon = meta.icon;

  const setField = (section, key) => (e) => {
    const value = e.target.value;
    setForm((f) =>
      section ? { ...f, [section]: { ...f[section], [key]: value } } : { ...f, [key]: value },
    );
  };

  const handleSave = () => {
    updateStore.mutate(form, {
      onSuccess: () => toast({ title: "Saved" }),
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Save failed", variant: "destructive" }),
    });
  };

  const handleSubmit = () => {
    // Persist edits first, then submit for review.
    updateStore.mutate(form, {
      onSuccess: () =>
        submitReview.mutate(undefined, {
          onSuccess: () => toast({ title: "Submitted for review!" }),
          onError: (err) =>
            toast({
              title: err.response?.data?.message || "Could not submit",
              variant: "destructive",
            }),
        }),
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Save failed", variant: "destructive" }),
    });
  };

  const busy = updateStore.isPending || submitReview.isPending;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] grid place-items-center shadow-lg shadow-[#D2691E]/20">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 leading-tight">{store.name}</h1>
              <p className="text-xs text-stone-500">Merchant onboarding</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-stone-400 hover:text-red-500 flex items-center gap-1 text-sm"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl px-4 py-3 flex items-center gap-2 font-semibold ${meta.cls}`}
        >
          <StatusIcon className="h-5 w-5" />
          {meta.label}
        </motion.div>

        {status === "rejected" && store.rejectionReason && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            <span className="font-semibold">Reviewer note:</span> {store.rejectionReason}
          </div>
        )}

        {status === "approved" && (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-stone-700 font-semibold">Your store is live on the marketplace.</p>
            <Link to="/owner/dashboard">
              <Button className="rounded-xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white font-bold">
                Go to dashboard
              </Button>
            </Link>
          </div>
        )}

        {status === "pending" && (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center space-y-2">
            <Clock className="h-10 w-10 text-amber-500 mx-auto" />
            <p className="text-stone-700 font-semibold">Your application is under review.</p>
            <p className="text-sm text-stone-500">
              We&apos;ll notify you once an admin approves your store.
            </p>
          </div>
        )}

        {editable && (
          <div className="space-y-5">
            <Section title="Store details">
              <FieldRow>
                <Field label="Short description">
                  <Input
                    value={form.description}
                    onChange={setField(null, "description")}
                    className={inputCls}
                    placeholder="What do you sell?"
                  />
                </Field>
              </FieldRow>
            </Section>

            <Section title="KYC / legal">
              <FieldRow>
                <Field label="Business type">
                  <Input
                    value={form.kyc.businessType}
                    onChange={setField("kyc", "businessType")}
                    className={inputCls}
                    placeholder="individual / pvt_ltd"
                  />
                </Field>
                <Field label="PAN *">
                  <Input
                    value={form.kyc.pan}
                    onChange={setField("kyc", "pan")}
                    className={inputCls}
                    placeholder="ABCDE1234F"
                  />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="GST number">
                  <Input
                    value={form.kyc.gstNumber}
                    onChange={setField("kyc", "gstNumber")}
                    className={inputCls}
                    placeholder="GSTIN (or FSSAI below)"
                  />
                </Field>
                <Field label="FSSAI license">
                  <Input
                    value={form.kyc.fssaiLicense}
                    onChange={setField("kyc", "fssaiLicense")}
                    className={inputCls}
                    placeholder="14-digit license"
                  />
                </Field>
              </FieldRow>
            </Section>

            <Section title="Bank account (payouts)">
              <FieldRow>
                <Field label="Account holder">
                  <Input
                    value={form.bank.accountHolder}
                    onChange={setField("bank", "accountHolder")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Account number *">
                  <Input
                    value={form.bank.accountNumber}
                    onChange={setField("bank", "accountNumber")}
                    className={inputCls}
                  />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="IFSC *">
                  <Input
                    value={form.bank.ifsc}
                    onChange={setField("bank", "ifsc")}
                    className={inputCls}
                    placeholder="HDFC0001234"
                  />
                </Field>
              </FieldRow>
            </Section>

            <Section title="Store address">
              <FieldRow>
                <Field label="Address line 1">
                  <Input
                    value={form.address.line1}
                    onChange={setField("address", "line1")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Line 2">
                  <Input
                    value={form.address.line2}
                    onChange={setField("address", "line2")}
                    className={inputCls}
                  />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="City *">
                  <Input
                    value={form.address.city}
                    onChange={setField("address", "city")}
                    className={inputCls}
                  />
                </Field>
                <Field label="State">
                  <Input
                    value={form.address.state}
                    onChange={setField("address", "state")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Pincode">
                  <Input
                    value={form.address.pincode}
                    onChange={setField("address", "pincode")}
                    className={inputCls}
                  />
                </Field>
              </FieldRow>
            </Section>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                onClick={handleSave}
                disabled={busy}
                variant="outline"
                className="rounded-xl border-2 border-stone-200 font-semibold sm:flex-1"
              >
                {updateStore.isPending ? "Saving…" : "Save draft"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={busy}
                className="rounded-xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white font-bold sm:flex-1"
              >
                {submitReview.isPending ? "Submitting…" : "Submit for review"}
              </Button>
            </div>
            <p className="text-xs text-stone-400 text-center">
              PAN, one of GST/FSSAI, bank account + IFSC, and a city are required to submit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const inputCls =
  "h-11 rounded-xl bg-white border-2 border-stone-200 focus-visible:border-[#D2691E] w-full";

const Section = ({ title, children }) => (
  <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
    <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">{title}</h2>
    {children}
  </div>
);

const FieldRow = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-stone-600">{label}</Label>
    {children}
  </div>
);

export default MerchantOnboarding;
