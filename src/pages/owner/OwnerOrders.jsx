import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useOwnerOrders, useOwnerUpdateOrderStatus } from "@/hooks/useOwner";
import { useGenerateOtp, useVerifyOtp } from "@/hooks/useOrders";
import { useRequestRider } from "@/hooks/useDispatch";
import { useToast } from "../../store/Toast";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import ImagePreview from "@/components/atoms/ImagePreview";
import {
  Eye,
  Key,
  CheckCircle,
  ShieldCheck,
  X,
  Phone,
  Image as ImageIcon,
  Printer,
  Bike,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/store/authStore";
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";

const STATUS_OPTIONS = ["accepted", "preparing", "out_for_delivery", "cancelled"];
const FILTERS = [
  "all",
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

// Print a minimal kitchen ticket for an order (opens the browser print dialog).
const printKitchenTicket = (order) => {
  const rows = (order.items || [])
    .map(
      (i) =>
        `<tr><td>${i.quantity} ×</td><td>${i.product?.name || ""}${i.variant ? ` (${i.variant})` : ""}</td></tr>`,
    )
    .join("");
  const html = `<html><head><title>Ticket ${order._id.slice(-8)}</title>
    <style>body{font-family:monospace;padding:16px;max-width:320px}h2{margin:0 0 4px}table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}hr{border:none;border-top:1px dashed #000}</style>
    </head><body>
    <h2>KITCHEN TICKET</h2>
    <div>#${order._id.slice(-8).toUpperCase()}</div>
    <div>${new Date(order.createdAt).toLocaleString()}</div>
    <div>${order.customer?.name || "Guest"}${order.customerPhone ? ` · ${order.customerPhone}` : ""}</div>
    <hr/><table>${rows}</table><hr/>
    ${order.orderNotes ? `<div><b>Notes:</b> ${order.orderNotes}</div>` : ""}
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}</script>
    </body></html>`;
  const w = window.open("", "_blank", "width=360,height=600");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
};

const OtpVerificationDialog = ({ order, onClose }) => {
  const [otp, setOtp] = useState("");
  const verifyOtp = useVerifyOtp();
  const { toast } = useToast();

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: "OTP must be 6 digits", variant: "destructive" });
      return;
    }
    verifyOtp.mutate(
      { id: order._id, otp },
      {
        onSuccess: () => {
          toast({ title: "Delivery confirmed successfully!" });
          setOtp("");
          onClose();
        },
        onError: (err) =>
          toast({
            title: err.response?.data?.message || "Invalid OTP",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          Verify Delivery OTP
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleVerify} className="space-y-4 mt-2">
        <div className="text-center">
          <p className="text-sm text-stone-500 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-stone-400">Ask the customer for the 6-digit OTP</p>
        </div>
        <div className="flex justify-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-40 text-center text-2xl font-bold tracking-[0.3em] font-mono border-2 border-indigo-300 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={verifyOtp.isLoading || otp.length !== 6}
          >
            {verifyOtp.isLoading ? "Verifying..." : "Confirm Delivery"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Rider assignment control for one order (D3): request a rider, or show the
// live assignment state (searching / assigned).
const RiderControl = ({ order, onRequest, pending }) => {
  const a = order.assignment || {};
  if (order.deliveryPartner || a.status === "accepted") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 gap-1">
        <Bike className="h-3 w-3" /> Rider assigned
      </Badge>
    );
  }
  if (a.status === "searching" || a.status === "offered") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Finding rider…
      </Badge>
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      className="border-teal-300 text-teal-700 hover:bg-teal-50 gap-1.5"
      onClick={onRequest}
    >
      <Bike className="h-3.5 w-3.5" /> {a.status === "failed" ? "Retry rider" : "Request rider"}
    </Button>
  );
};

const OwnerOrders = () => {
  const { data: orders, isLoading } = useOwnerOrders();
  const updateStatus = useOwnerUpdateOrderStatus();
  const generateOtp = useGenerateOtp();
  const requestRider = useRequestRider();
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpDialogOrder, setOtpDialogOrder] = useState(null);
  const [filter, setFilter] = useState("all");

  // Live: refresh the list when a rider accepts or the search fails (D3).
  useEffect(() => {
    if (!user?.id) return;
    connectSocket(user.id);
    const s = getSocket();
    const refresh = () => qc.invalidateQueries({ queryKey: ["owner-orders"] });
    s.on("order_assigned", refresh);
    s.on("order_assignment_failed", refresh);
    return () => {
      s.off("order_assigned", refresh);
      s.off("order_assignment_failed", refresh);
      disconnectSocket();
    };
  }, [user?.id, qc]);

  const visibleOrders = (orders || []).filter((o) => filter === "all" || o.orderStatus === filter);
  const countFor = (f) =>
    f === "all" ? (orders?.length ?? 0) : (orders || []).filter((o) => o.orderStatus === f).length;

  const handleStatusChange = (id, status) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          if (status === "out_for_delivery") {
            toast({
              title: "Marked as out for delivery. Generate OTP when you reach the customer.",
            });
          } else {
            toast({ title: "Status updated" });
          }
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
      },
    );
  };

  const handleRequestRider = (id) => {
    requestRider.mutate(id, {
      onSuccess: (res) => {
        const d = res.data?.data;
        toast({
          title:
            d?.status === "offered"
              ? "Rider found — waiting for them to accept"
              : d?.status === "failed"
                ? `No rider available: ${d.reason || "try again shortly"}`
                : "Searching for a rider…",
        });
      },
      onError: (err) =>
        toast({
          title: err.response?.data?.message || "Could not request a rider",
          variant: "destructive",
        }),
    });
  };

  const handleGenerateOtp = (id) => {
    generateOtp.mutate(id, {
      onSuccess: (res) => {
        toast({ title: `OTP generated: ${res.data?.data?.otp || "sent to customer"}` });
      },
      onError: (err) =>
        toast({
          title: err.response?.data?.message || "Failed to generate OTP",
          variant: "destructive",
        }),
    });
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
        <h1 className="text-2xl font-bold">Orders ({orders?.length ?? 0})</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {countFor("placed")} pending
        </Badge>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              filter === f
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {f.replace(/_/g, " ")} ({countFor(f)})
          </button>
        ))}
      </div>

      {!visibleOrders.length ? (
        <EmptyState icon="📭" title="No orders here" />
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="font-semibold mt-1">{order.customer?.name || "Guest"}</p>
                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3 w-3" /> {order.customerPhone}
                      </a>
                    )}
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {order.items?.slice(0, 3).map((item) => (
                        <span key={item._id} className="text-sm text-muted-foreground">
                          {item.product?.name} × {item.quantity}
                        </span>
                      ))}
                      {order.items?.length > 3 && (
                        <span className="text-sm text-muted-foreground">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-primary mt-1.5 text-lg">
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Order #{order._id.slice(-8).toUpperCase()}</DialogTitle>
                        </DialogHeader>
                        <OrderDetail order={order} />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printKitchenTicket(order)}
                      title="Print kitchen ticket"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </Button>

                    {/* New orders: one-tap accept / reject */}
                    {order.orderStatus === "placed" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          disabled={updateStatus.isLoading}
                          onClick={() => handleStatusChange(order._id, "accepted")}
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                          disabled={updateStatus.isLoading}
                          onClick={() => handleStatusChange(order._id, "cancelled")}
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}

                    {["accepted", "preparing", "out_for_delivery"].includes(order.orderStatus) && (
                      <RiderControl
                        order={order}
                        onRequest={() => handleRequestRider(order._id)}
                        pending={requestRider.isPending}
                      />
                    )}

                    {order.orderStatus === "out_for_delivery" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateOtp(order._id)}
                        disabled={generateOtp.isLoading}
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 gap-1.5"
                      >
                        <Key className="h-3.5 w-3.5" />
                        {generateOtp.isLoading ? "Generating..." : "Generate OTP"}
                      </Button>
                    )}

                    {order.orderStatus === "waiting_for_otp" && (
                      <Dialog
                        open={otpDialogOrder?._id === order._id}
                        onOpenChange={(open) => {
                          if (!open) setOtpDialogOrder(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setOtpDialogOrder(order)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Enter OTP
                          </Button>
                        </DialogTrigger>
                        <OtpVerificationDialog
                          order={order}
                          onClose={() => setOtpDialogOrder(null)}
                        />
                      </Dialog>
                    )}

                    {["accepted", "preparing"].includes(order.orderStatus) && (
                      <Select onValueChange={(val) => handleStatusChange(order._id, val)}>
                        <SelectTrigger className="w-[150px] h-8 text-xs">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

const OrderDetail = ({ order }) => (
  <div className="space-y-4 mt-2">
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-muted-foreground">Customer</p>
        <p className="font-medium">{order.customer?.name || "Guest"}</p>
        {order.customerPhone && (
          <a
            href={`tel:${order.customerPhone}`}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5"
          >
            <Phone className="h-3 w-3" /> {order.customerPhone}
          </a>
        )}
      </div>
      <div>
        <p className="text-muted-foreground">Date</p>
        <p className="font-medium">{formatDate(order.createdAt)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Payment</p>
        <p className="font-medium capitalize">{order.paymentMethod || "N/A"}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Status</p>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}
        >
          {order.orderStatus.replace(/_/g, " ")}
        </span>
      </div>
    </div>

    {order.deliveryAddress && (
      <div>
        <p className="text-sm text-muted-foreground">Delivery Address</p>
        <p className="text-sm font-medium">
          {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
          {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
        </p>
        {order.deliveryDistance > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            📍 {order.deliveryDistance} km from store
          </p>
        )}
      </div>
    )}

    <Separator />

    <div>
      <p className="text-sm text-muted-foreground mb-2">Items</p>
      <div className="space-y-3">
        {order.items?.map((item) => (
          <div key={item._id} className="flex items-center gap-3 text-sm">
            {item.product?.images?.length > 0 ? (
              <ImagePreview images={item.product.images}>
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover border border-stone-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                />
              </ImagePreview>
            ) : (
              <div className="h-14 w-14 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                <ImageIcon className="h-5 w-5 text-stone-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.product?.name}</p>
              {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
              <p className="text-xs text-muted-foreground">× {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <Separator />
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Subtotal</span>
      <span>{formatPrice(order.totalPrice - (order.deliveryFee || 0))}</span>
    </div>
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Delivery ({order.deliveryType === "fast" ? "Fast" : "Normal"})
        {order.deliveryDistance > 0 ? ` (${order.deliveryDistance} km)` : ""}
      </span>
      <span>
        {order.deliveryFee > 0 ? (
          formatPrice(order.deliveryFee)
        ) : (
          <span className="text-green-600 font-medium">FREE</span>
        )}
      </span>
    </div>
    <Separator />
    <div className="flex items-center justify-between text-base font-bold">
      <span>Total</span>
      <span className="text-primary">{formatPrice(order.totalPrice)}</span>
    </div>
  </div>
);

export default OwnerOrders;
