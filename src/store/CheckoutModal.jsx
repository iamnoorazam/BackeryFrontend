import { createContext, useContext, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CheckoutForm from "@/components/organisms/CheckoutForm";
import { useCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useAuth } from "@/store/authStore";

const CheckoutModalContext = createContext({ openCheckout: () => {}, closeCheckout: () => {} });

/**
 * Mounts the checkout experience as a bottom-sheet (mobile) / centered modal
 * (desktop) once, and exposes openCheckout()/closeCheckout() to anywhere inside
 * the customer shell (cart drawer, Cart page). The full-page /checkout route
 * still exists as a deep-link fallback and reuses the same CheckoutForm.
 */
export const CheckoutModalProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { data: cart } = useCart();
  const placeOrder = usePlaceOrder();

  const [open, setOpen] = useState(false);
  const dirtyRef = useRef(false);
  const completedRef = useRef(false);

  const openCheckout = useCallback(() => {
    // Deep-link guests to login first, preserving the existing flow.
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    dirtyRef.current = false;
    completedRef.current = false;
    setOpen(true);
  }, [isLoggedIn, navigate]);

  const closeCheckout = useCallback(() => setOpen(false), []);

  const handleOpenChange = (next) => {
    if (!next && dirtyRef.current && !completedRef.current) {
      const ok = window.confirm("Discard your checkout details? Your progress will be lost.");
      if (!ok) return;
    }
    setOpen(next);
  };

  return (
    <CheckoutModalContext.Provider value={{ openCheckout, closeCheckout }}>
      {children}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl lg:max-w-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 sm:px-6 pt-5 pb-3 border-b border-border text-left">
            <DialogTitle className="text-lg">Checkout</DialogTitle>
            <DialogDescription className="sr-only">Complete your order in three steps</DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto px-5 sm:px-6 py-5">
            {open && (
              <CheckoutForm
                stepped
                cart={cart}
                user={user}
                isLoggedIn={isLoggedIn}
                placeOrder={placeOrder}
                onDirtyChange={(d) => { dirtyRef.current = d; }}
                onOrderSuccess={() => { completedRef.current = true; }}
                onViewOrders={() => { setOpen(false); navigate("/orders"); }}
                onContinueShopping={() => { setOpen(false); navigate("/products"); }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </CheckoutModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCheckoutModal = () => useContext(CheckoutModalContext);
