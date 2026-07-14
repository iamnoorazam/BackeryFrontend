import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useOwnerOrders, useOwnerUpdateOrderStatus } from "@/hooks/useOwner";
import { useGenerateOtp, useVerifyOtp } from "@/hooks/useOrders";
import { useToast } from "../../store/Toast";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { Eye, Key, CheckCircle, ShieldCheck, X } from "lucide-react";

const STATUS_OPTIONS = ["accepted", "preparing", "out_for_delivery", "cancelled"];

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

const OwnerOrders = () => {
  const { data: orders, isLoading } = useOwnerOrders();
  const updateStatus = useOwnerUpdateOrderStatus();
  const generateOtp = useGenerateOtp();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpDialogOrder, setOtpDialogOrder] = useState(null);

  const handleStatusChange = (id, status) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          if (status === "out_for_delivery") {
            toast({ title: "Marked as out for delivery. Generate OTP when you reach the customer." });
          } else {
            toast({ title: "Status updated" });
          }
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
      },
    );
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

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders ({orders?.length ?? 0})</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {orders?.filter((o) => o.orderStatus === "placed").length ?? 0} pending
        </Badge>
      </div>

      {!orders?.length ? (
        <EmptyState icon="📭" title="No orders yet" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="font-semibold mt-1">{order.customer?.name || "Guest"}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {order.items?.slice(0, 3).map((item) => (
                        <span key={item._id} className="text-sm text-muted-foreground">
                          {item.product?.name} × {item.quantity}
                        </span>
                      ))}
                      {order.items?.length > 3 && (
                        <span className="text-sm text-muted-foreground">+{order.items.length - 3} more</span>
                      )}
                    </div>
                    <p className="font-bold text-primary mt-1.5 text-lg">{formatPrice(order.totalPrice)}</p>
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
                      <Dialog open={otpDialogOrder?._id === order._id} onOpenChange={(open) => { if (!open) setOtpDialogOrder(null); }}>
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
                        <OtpVerificationDialog order={order} onClose={() => setOtpDialogOrder(null)} />
                      </Dialog>
                    )}

                    {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && order.orderStatus !== "out_for_delivery" && order.orderStatus !== "waiting_for_otp" && (
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus.replace(/_/g, " ")}
        </span>
      </div>
    </div>

    {order.deliveryAddress && (
      <div>
        <p className="text-sm text-muted-foreground">Delivery Address</p>
        <p className="text-sm font-medium">
          {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
        </p>
        {order.deliveryDistance > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">📍 {order.deliveryDistance} km from store</p>
        )}
      </div>
    )}

    <Separator />

    <div>
      <p className="text-sm text-muted-foreground mb-2">Items</p>
      <div className="space-y-2">
        {order.items?.map((item) => (
          <div key={item._id} className="flex items-center justify-between text-sm">
            <span>
              {item.product?.name} <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
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
      <span>Delivery ({order.deliveryType === "fast" ? "Fast" : "Normal"}){order.deliveryDistance > 0 ? ` (${order.deliveryDistance} km)` : ""}</span>
      <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : <span className="text-green-600 font-medium">FREE</span>}</span>
    </div>
    <Separator />
    <div className="flex items-center justify-between text-base font-bold">
      <span>Total</span>
      <span className="text-primary">{formatPrice(order.totalPrice)}</span>
    </div>
  </div>
);

export default OwnerOrders;
