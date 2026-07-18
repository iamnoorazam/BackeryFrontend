import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { Package, Clock } from "lucide-react";

const OrderCard = ({ order }) => {
  const status = order.orderStatus?.replace(/_/g, " ");
  const colorClass = getStatusColor(order.orderStatus);

  return (
    <Card className="animate-fade-up overflow-hidden">
      <div className={`h-1 ${order.orderStatus === "delivered" ? "bg-success" : order.orderStatus === "cancelled" ? "bg-danger" : "bg-primary"}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-muted-foreground/70" />
                <p className="text-xs text-muted-foreground/70">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
          <Badge className={`${colorClass} border-0 capitalize text-[10px] px-2.5 py-0.5`}>
            {status}
          </Badge>
        </div>

        <div className="mt-3 space-y-1">
          {order.items?.slice(0, 3).map((item) => (
            <p key={item._id} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{item.product?.name}</span>
              {" × "}{item.quantity}
            </p>
          ))}
          {order.items?.length > 3 && (
            <p className="text-xs text-muted-foreground/70">+{order.items.length - 3} more items</p>
          )}
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-md ${order.paymentMethod === "cod" ? "bg-primary/10 text-primary" : "chip-info"}`}>
            {order.paymentMethod === "cod" ? "COD" : "Online"}
          </span>
          <span className="text-lg font-bold text-foreground">{formatPrice(order.totalPrice)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
