import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FormField from "@/components/molecules/FormField";
import OrderCard from "@/components/molecules/OrderCard";
import OrderTracker from "@/components/molecules/OrderTracker";
import LiveTracking from "@/components/molecules/LiveTracking";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import {
  useMyOrders,
  useCancelOrder,
  useUpdateAddress,
  useDeliveryOtp,
  useOrderStatusStream,
} from "@/hooks/useOrders";
import { useToast } from "../store/Toast";
import { useCreateIssue } from "@/hooks/useIssues";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import {
  MapPin,
  Pencil,
  Copy,
  Check,
  Shield,
  Phone,
  User,
  Mail,
  Package,
  X,
  Clock,
  AlertTriangle,
  Bug,
} from "lucide-react";

const AddressEditDialog = ({ order }) => {
  const { toast } = useToast();
  const updateAddress = useUpdateAddress();
  const [open, setOpen] = useState(false);
  const addr = order.deliveryAddress || {};
  const [form, setForm] = useState({
    line1: addr.line1 || addr.street || "",
    line2: addr.line2 || "",
    city: addr.city || "",
    state: addr.state || "",
    postalCode: addr.postalCode || addr.pincode || "",
    country: addr.country || "IN",
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAddress.mutate(
      { id: order._id, deliveryAddress: form },
      {
        onSuccess: () => {
          toast({ title: "Address updated successfully" });
          setOpen(false);
        },
        onError: (err) =>
          toast({
            title: err.response?.data?.message || "Failed to update",
            variant: "destructive",
          }),
      },
    );
  };

  const canEdit = !["delivered", "cancelled"].includes(order.orderStatus);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!canEdit} className="gap-1.5 rounded-xl">
          <Pencil className="h-3.5 w-3.5" /> Edit Address
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Delivery Address</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <FormField
            label="Address Line 1"
            value={form.line1}
            onChange={set("line1")}
            placeholder="123 Main St"
            required
          />
          <FormField
            label="Address Line 2"
            value={form.line2}
            onChange={set("line2")}
            placeholder="Apartment, suite"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="City"
              value={form.city}
              onChange={set("city")}
              placeholder="Mumbai"
              required
            />
            <FormField
              label="State"
              value={form.state}
              onChange={set("state")}
              placeholder="Maharashtra"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Postal Code"
              value={form.postalCode}
              onChange={set("postalCode")}
              placeholder="400001"
              required
            />
            <FormField
              label="Country"
              value={form.country}
              onChange={set("country")}
              placeholder="IN"
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={updateAddress.isLoading}>
            {updateAddress.isLoading ? "Updating..." : "Save Address"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeliveryOtpDisplay = ({ orderId }) => {
  const { data: otpData, isLoading } = useDeliveryOtp(orderId);
  const [copied, setCopied] = useState(false);
  const otp = otpData?.otp || "";

  const handleCopy = () => {
    if (otp) {
      navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) return null;

  return (
    <div className="mt-3 p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-indigo-600" />
        <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
          Delivery OTP
        </p>
      </div>
      <p className="text-[11px] text-indigo-600 mb-3">
        Share this OTP with the delivery partner <strong>only after</strong> you receive your order.
      </p>
      <div className="flex items-center gap-2">
        <div className="bg-white border-2 border-indigo-300 rounded-xl px-4 py-3 flex-1 text-center">
          <span className="text-2xl font-bold tracking-[0.3em] text-indigo-900 font-mono">
            {otp || "------"}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="h-12 w-12 border-indigo-300 hover:bg-indigo-100 shrink-0 rounded-xl"
        >
          {copied ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <Copy className="h-5 w-5 text-indigo-600" />
          )}
        </Button>
      </div>
    </div>
  );
};

const OrderDetailCard = ({ order }) => {
  const subtotal = order.items?.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0) || 0;
  const addr = order.deliveryAddress || {};
  const formatAddr = (a) => {
    if (!a || !a.line1) return "";
    return `${a.line1}${a.line2 ? ", " + a.line2 : ""}, ${a.city}, ${a.state} ${a.postalCode}, ${a.country}`;
  };

  return (
    <Card className="animate-fade-up overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-stone-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {order.vendor?.name && (
                  <span className="text-xs font-semibold text-stone-900">{order.vendor.name}</span>
                )}
                <p className="text-xs text-stone-400 font-mono">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-stone-400" />
                <p className="text-xs text-stone-400">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusColor(order.orderStatus)}`}
          >
            {order.orderStatus.replace(/_/g, " ")}
          </span>
        </div>

        {order.customerName && (
          <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {order.customerName}
            </span>
            {order.customerPhone && (
              <>
                <span className="text-stone-200">|</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {order.customerPhone}
                </span>
              </>
            )}
          </div>
        )}

        <div className="mt-3 space-y-1">
          {order.items?.map((item) => (
            <p key={item._id} className="text-sm text-stone-600">
              <span className="font-medium text-stone-900">{item.product?.name}</span> ×{" "}
              {item.quantity}
            </p>
          ))}
        </div>

        <OrderTracker status={order.orderStatus} statusHistory={order.statusHistory} />

        {order.deliveryPartner &&
          !["delivered", "cancelled", "placed"].includes(order.orderStatus) && (
            <LiveTracking order={order} />
          )}

        {addr.line1 && (
          <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#D2691E] shrink-0 mt-0.5" />
              <div className="text-xs text-stone-600 leading-relaxed">{formatAddr(addr)}</div>
            </div>
            {order.deliveryDistance > 0 && (
              <p className="text-[10px] text-stone-400 pl-6">
                {order.deliveryDistance} km from store
                {order.estimatedDeliveryTime && (
                  <span className="ml-2">~{order.estimatedDeliveryTime}</span>
                )}
              </p>
            )}
            {order.orderNotes && (
              <p className="text-[10px] text-stone-400 pl-6 italic">Note: {order.orderNotes}</p>
            )}
          </div>
        )}

        {order.orderStatus === "waiting_for_otp" && <DeliveryOtpDisplay orderId={order._id} />}

        <Separator className="my-3" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-stone-500">
            <span>Subtotal</span>
            <span className="text-stone-900">{formatPrice(subtotal)}</span>
          </div>
          {order.packagingCharge > 0 && (
            <div className="flex justify-between text-stone-500">
              <span>Packaging</span>
              <span className="text-stone-900">{formatPrice(order.packagingCharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-500">
            <span>
              Delivery
              {order.deliveryDistance > 0 && (
                <span className="text-stone-400 ml-1">({order.deliveryDistance} km)</span>
              )}
            </span>
            <span className="text-stone-900">
              {order.deliveryFee > 0 ? (
                formatPrice(order.deliveryFee)
              ) : (
                <span className="text-emerald-600 font-medium">FREE</span>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
          <span
            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${order.paymentMethod === "cod" ? "bg-[#FFF8F0] text-[#D2691E]" : "bg-sky-50 text-sky-700"}`}
          >
            {order.paymentMethod === "cod" ? "COD" : "Online"}
          </span>
          <span className="text-lg font-bold text-stone-900">{formatPrice(order.totalPrice)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomerReportIssue = ({ orderId, customerName, customerPhone }) => {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState("other");
  const [description, setDescription] = useState("");
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
        orderId,
        issueType,
        description: description.trim(),
        customerName: customerName || "",
        customerPhone: customerPhone || "",
      });
      toast({ title: "Issue reported! We'll contact you soon." });
      setOpen(false);
      setDescription("");
      setIssueType("other");
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
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 rounded-xl"
        >
          <Bug className="h-3.5 w-3.5" /> Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Report an Issue
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="payment">Payment Issue</option>
              <option value="delivery">Delivery Issue</option>
              <option value="product">Product Issue</option>
              <option value="app">App/Website Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">
              Describe the issue <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what went wrong..."
              rows={4}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl"
            disabled={createIssue.isPending}
          >
            {createIssue.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Group orders by their checkout group so a multi-store order reads as one
// order that fanned out to N stores, while single-store orders stay standalone.
const groupOrders = (orders = []) => {
  const groups = [];
  const byKey = new Map();
  for (const order of orders) {
    const key = order.orderGroup || order._id;
    if (!byKey.has(key)) {
      const g = { key, orders: [] };
      byKey.set(key, g);
      groups.push(g);
    }
    byKey.get(key).orders.push(order);
  }
  return groups;
};

const Orders = () => {
  const { data: orders, isLoading } = useMyOrders();
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();
  useOrderStatusStream(); // live status updates via socket

  const handleCancel = (id) => {
    cancelOrder.mutate(id, {
      onSuccess: () => toast({ title: "Order cancelled" }),
      onError: (err) =>
        toast({
          title: err.response?.data?.message || "Cannot cancel order",
          variant: "destructive",
        }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-stone-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-8"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">My Orders</h1>
      <p className="text-stone-400 text-sm mb-6">Track and manage your orders</p>

      {!orders?.length ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="Place your first order today!"
          action={
            <Button variant="premium" asChild>
              <a href="/products">Browse Menu</a>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groupOrders(orders).map((group) => {
            const isMultiStore = group.orders.length > 1;
            const groupTotal = group.orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
            return (
              <div
                key={group.key}
                className={
                  isMultiStore
                    ? "rounded-2xl border border-stone-200 bg-stone-50/50 p-3 space-y-4"
                    : "space-y-4"
                }
              >
                {isMultiStore && (
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-semibold text-stone-500">
                      {group.orders.length} stores in this order
                    </p>
                    <p className="text-sm font-bold text-stone-900">{formatPrice(groupTotal)}</p>
                  </div>
                )}
                {group.orders.map((order) => (
                  <div key={order._id}>
                    <OrderDetailCard order={order} />
                    <div className="flex gap-2 mt-2">
                      {order.orderStatus === "placed" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(order._id)}
                          disabled={cancelOrder.isLoading}
                          className="rounded-xl"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Cancel Order
                        </Button>
                      )}
                      <AddressEditDialog order={order} />
                      <CustomerReportIssue
                        orderId={order._id}
                        customerName={order.customerName}
                        customerPhone={order.customerPhone}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Orders;
