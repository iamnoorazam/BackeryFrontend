import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Bike, CheckCircle2, Clock, AlertCircle, Ban, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useMyPartnerProfile,
  useUpdateMyPartnerProfile,
  useSubmitPartnerForReview,
} from "@/hooks/useDeliveryPartner";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/store/Toast";

const STATUS_META = {
  draft: { label: "Draft", icon: AlertCircle, cls: "bg-stone-100 text-stone-600" },
  pending: { label: "Under review", icon: Clock, cls: "bg-amber-100 text-amber-700" },
  approved: {
    label: "Approved · Active",
    icon: CheckCircle2,
    cls: "bg-emerald-100 text-emerald-700",
  },
  rejected: { label: "Changes requested", icon: AlertCircle, cls: "bg-red-100 text-red-700" },
  suspended: { label: "Suspended", icon: Ban, cls: "bg-orange-100 text-orange-700" },
  blocked: { label: "Blocked", icon: Ban, cls: "bg-red-100 text-red-700" },
};

const VEHICLE_TYPES = ["bike", "scooter", "bicycle", "ev", "car"];

const emptyForm = {
  kyc: { aadhaar: "", pan: "", drivingLicense: "" },
  vehicle: { type: "bike", registrationNumber: "", rcNumber: "", insuranceNumber: "" },
  bank: { accountHolder: "", accountNumber: "", ifsc: "", upi: "" },
  address: { line1: "", line2: "", city: "", state: "", pincode: "" },
  emergencyContact: { name: "", phone: "", relation: "" },
};

const DeliveryOnboarding = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const { data: partner, isLoading } = useMyPartnerProfile();
  const updateProfile = useUpdateMyPartnerProfile();
  const submitReview = useSubmitPartnerForReview();

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!partner) return;
    setForm({
      kyc: { ...emptyForm.kyc, ...(partner.kyc || {}) },
      vehicle: { ...emptyForm.vehicle, ...(partner.vehicle || {}) },
      bank: { ...emptyForm.bank, ...(partner.bank || {}) },
      address: { ...emptyForm.address, ...(partner.address || {}) },
      emergencyContact: { ...emptyForm.emergencyContact, ...(partner.emergencyContact || {}) },
    });
  }, [partner]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="text-stone-600">No delivery-partner profile found for this account.</p>
          <Link to="/delivery/register" className="text-[#0F766E] font-semibold hover:underline">
            Register as a partner
          </Link>
        </div>
      </div>
    );
  }

  const status = partner.verificationStatus || "draft";
  const editable = status === "draft" || status === "rejected";
  const meta = STATUS_META[status] || STATUS_META.draft;
  const StatusIcon = meta.icon;

  const setField = (section, key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
  };

  const handleSave = () => {
    updateProfile.mutate(form, {
      onSuccess: () => toast({ title: "Saved" }),
      onError: (err) =>
        toast({ title: err.response?.data?.message || "Save failed", variant: "destructive" }),
    });
  };

  const handleSubmit = () => {
    updateProfile.mutate(form, {
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

  const busy = updateProfile.isPending || submitReview.isPending;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#2DD4BF] grid place-items-center shadow-lg shadow-[#0F766E]/20">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 leading-tight">{partner.name}</h1>
              <p className="text-xs text-stone-500">Delivery-partner onboarding</p>
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

        {status === "rejected" && partner.rejectionReason && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            <span className="font-semibold">Reviewer note:</span> {partner.rejectionReason}
          </div>
        )}

        {status === "approved" && (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-stone-700 font-semibold">You&apos;re approved to deliver.</p>
            <Link to="/delivery/dashboard">
              <Button className="rounded-xl bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] text-white font-bold">
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
              We&apos;ll notify you once an admin approves your account.
            </p>
          </div>
        )}

        {(status === "suspended" || status === "blocked") && (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center space-y-2">
            <Ban className="h-10 w-10 text-orange-500 mx-auto" />
            <p className="text-stone-700 font-semibold">Your account is {status}.</p>
            <p className="text-sm text-stone-500">Contact support for assistance.</p>
          </div>
        )}

        {editable && (
          <div className="space-y-5">
            <Section title="KYC / identity">
              <FieldRow>
                <Field label="Aadhaar *">
                  <Input
                    value={form.kyc.aadhaar}
                    onChange={setField("kyc", "aadhaar")}
                    className={inputCls}
                    placeholder="12-digit"
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
                <Field label="Driving license *">
                  <Input
                    value={form.kyc.drivingLicense}
                    onChange={setField("kyc", "drivingLicense")}
                    className={inputCls}
                    placeholder="DL number"
                  />
                </Field>
              </FieldRow>
            </Section>

            <Section title="Vehicle">
              <FieldRow>
                <Field label="Type">
                  <select
                    value={form.vehicle.type}
                    onChange={setField("vehicle", "type")}
                    className={`${inputCls} px-3`}
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Registration number *">
                  <Input
                    value={form.vehicle.registrationNumber}
                    onChange={setField("vehicle", "registrationNumber")}
                    className={inputCls}
                    placeholder="UP65AB1234"
                  />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="RC number">
                  <Input
                    value={form.vehicle.rcNumber}
                    onChange={setField("vehicle", "rcNumber")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Insurance number">
                  <Input
                    value={form.vehicle.insuranceNumber}
                    onChange={setField("vehicle", "insuranceNumber")}
                    className={inputCls}
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
                <Field label="UPI ID">
                  <Input
                    value={form.bank.upi}
                    onChange={setField("bank", "upi")}
                    className={inputCls}
                    placeholder="name@upi"
                  />
                </Field>
              </FieldRow>
            </Section>

            <Section title="Address">
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

            <Section title="Emergency contact">
              <FieldRow>
                <Field label="Name">
                  <Input
                    value={form.emergencyContact.name}
                    onChange={setField("emergencyContact", "name")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={form.emergencyContact.phone}
                    onChange={setField("emergencyContact", "phone")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Relation">
                  <Input
                    value={form.emergencyContact.relation}
                    onChange={setField("emergencyContact", "relation")}
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
                {updateProfile.isPending ? "Saving…" : "Save draft"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={busy}
                className="rounded-xl bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] text-white font-bold sm:flex-1"
              >
                {submitReview.isPending ? "Submitting…" : "Submit for review"}
              </Button>
            </div>
            <p className="text-xs text-stone-400 text-center">
              Aadhaar, PAN, driving license, vehicle registration, bank account + IFSC, and a city
              are required to submit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const inputCls =
  "h-11 rounded-xl bg-white border-2 border-stone-200 focus-visible:border-[#0F766E] w-full";

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

export default DeliveryOnboarding;
