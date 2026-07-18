import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import CheckoutIssueButton from "./CheckoutIssueButton";

/**
 * Post-order confirmation panel. Renders the grouped split-checkout result
 * (one card per store when an order spanned multiple vendors) plus wallet/
 * payable breakdown, and a "report an issue" entry point for the placed order.
 */
const OrderConfirmation = ({ orderResult, onViewOrders, onContinueShopping, customerPhone, customerEmail, className }) => (
  <div className={`animate-fade-in ${className || ""}`}>
    <div className="bg-card border-2 border-success/30 rounded-xl p-6 sm:p-8 text-center shadow-lg max-w-lg mx-auto">
      <div className="mx-auto w-16 h-16 bg-success-subtle rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-success" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-success mb-1">Order Placed Successfully!</h2>
      <p className="text-xs text-muted-foreground/70 mb-1">Order #{orderResult.id.toString().slice(-8).toUpperCase()}</p>
      {orderResult.stores?.length > 1 && (
        <p className="text-xs text-[#D2691E] mb-1">Split into {orderResult.stores.length} store orders</p>
      )}
      <p className="text-sm text-muted-foreground mb-6">Thank you, {orderResult.name}!</p>

      <div className="bg-muted rounded-xl p-4 text-left space-y-2 text-sm border border-border">
        <h3 className="font-semibold text-foreground mb-2">Delivery Details</h3>
        <p className="text-muted-foreground"><span className="font-medium text-foreground">Address:</span> {orderResult.address}</p>

        {orderResult.stores?.length > 1 ? (
          <div className="space-y-2 pt-1">
            {orderResult.stores.map((s) => (
              <div key={s.id} className="rounded-lg bg-surface border border-border p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-foreground">₹{s.total}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/70">
                  {s.distance > 0 ? `${s.distance} km` : "—"}
                  {s.time && <span className="ml-1">· {s.time}</span>}
                  {s.delivery > 0 ? <span className="ml-1">· delivery ₹{s.delivery}</span> : <span className="ml-1 text-success">· free delivery</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Distance from store:</span> {orderResult.stores?.[0]?.distance || 0} km</p>
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Estimated delivery time:</span> {orderResult.time}</p>
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Delivery charge:</span> ₹{orderResult.stores?.[0]?.delivery || 0}</p>
          </>
        )}

        <Separator className="my-2" />
        <p className="text-muted-foreground"><span className="font-medium text-foreground">Order total:</span> ₹{orderResult.total}</p>
        {orderResult.walletUsed > 0 && (
          <>
            <p className="text-success"><span className="font-medium">Wallet credit used:</span> −₹{orderResult.walletUsed}</p>
            <p className="text-foreground font-semibold">Amount payable: ₹{orderResult.amountPayable}</p>
          </>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {onViewOrders ? (
          <Button type="button" className="flex-1" onClick={onViewOrders}>View Orders</Button>
        ) : (
          <Button type="button" className="flex-1" onClick={() => window.location.href = "/orders"}>View Orders</Button>
        )}
        {onContinueShopping ? (
          <Button type="button" variant="outline" className="flex-1" onClick={onContinueShopping}>Continue Shopping</Button>
        ) : (
          <Button type="button" variant="outline" className="flex-1" onClick={() => window.location.href = "/products"}>Continue Shopping</Button>
        )}
      </div>

      <div className="mt-4">
        <CheckoutIssueButton
          orderId={orderResult?.firstOrderId}
          userName={orderResult.name}
          customerPhone={customerPhone}
          customerEmail={customerEmail}
        />
      </div>
    </div>
  </div>
);

export default OrderConfirmation;
