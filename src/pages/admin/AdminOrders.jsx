import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useAllOrders } from "@/hooks/useOrders";
import { useToast } from "../../store/Toast";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import ImagePreview from "@/components/atoms/ImagePreview";
import { Eye, Phone, Image as ImageIcon, Users } from "lucide-react";

const statusOptions = ["placed", "accepted", "preparing", "out_for_delivery", "waiting_for_otp", "delivered", "cancelled"];

const OrderDetail = ({ order }) => (
  <div className="space-y-4 mt-2">
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-muted-foreground">Customer</p>
        <p className="font-medium">{order.customer?.name || order.customerName || "Guest"}</p>
        {(order.customerPhone) && (
          <a href={`tel:${order.customerPhone}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5">
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus.replace(/_/g, " ")}
        </span>
      </div>
    </div>

    {order.deliveryAddress && (
      <div>
        <p className="text-sm text-muted-foreground">Delivery Address</p>
        <p className="text-sm font-medium">
          {[order.deliveryAddress.street, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode].filter(Boolean).join(", ")}
        </p>
        {order.deliveryDistance > 0 && <p className="text-xs text-muted-foreground mt-0.5">📍 {order.deliveryDistance} km from store</p>}
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
                <img src={item.product.images[0]} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover border border-stone-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity" />
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
      <span>Delivery{order.deliveryDistance > 0 ? ` (${order.deliveryDistance} km)` : ""}</span>
      <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : <span className="text-green-600 font-medium">FREE</span>}</span>
    </div>
    <Separator />
    <div className="flex items-center justify-between text-base font-bold">
      <span>Total</span>
      <span className="text-primary">{formatPrice(order.totalPrice)}</span>
    </div>
  </div>
);

const AdminOrders = () => {
  const { data: orders, isLoading } = useAllOrders();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = statusFilter === "all" ? (orders || []) : (orders || []).filter((o) => o.orderStatus === statusFilter);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Orders ({orders?.length ?? 0})</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!filtered.length ? (
        <EmptyState icon="📭" title="No orders found" />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
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
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="font-semibold text-sm">{order.customer?.name || order.customerName || "Guest"}</p>
                      {order.owner?.name && <Badge variant="outline" className="text-[10px]">{order.owner.name}</Badge>}
                    </div>
                    {order.customerPhone && (
                      <a href={`tel:${order.customerPhone}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {order.customerPhone}
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {order.items?.slice(0, 3).map((item) => (
                        <span key={item._id} className="text-sm text-muted-foreground">
                          {item.product?.name} × {item.quantity}
                        </span>
                      ))}
                      {order.items?.length > 3 && <span className="text-sm text-muted-foreground">+{order.items.length - 3} more</span>}
                    </div>
                    <p className="font-bold text-primary mt-1.5 text-lg">{formatPrice(order.totalPrice)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
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

export default AdminOrders;
