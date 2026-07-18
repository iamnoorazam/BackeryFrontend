// Checkout pricing config.
//
// The delivery tiers mirror the backend (delivery.service.js → getDeliveryCharge)
// so the fee shown at checkout equals the fee billed on the placed order. When a
// backend distance quote is available we use ITS deliveryCharge (authoritative);
// these tiers are the display labels + a client-side fallback.
//
// Platform fee and tax are display-layer extras — tune via Vite env
// (VITE_PLATFORM_FEE, VITE_TAX_RATE) or leave at 0 to keep totals == backend.

export const DELIVERY_TIERS = [
  { max: 2, fee: 0, label: "0–2 km", note: "Free" },
  { max: 5, fee: 20, label: "2–5 km" },
  { max: 10, fee: 40, label: "5–10 km" },
  { max: 15, fee: 60, label: "10–15 km" },
];
export const BEYOND_FEE = 80;

export const MAX_DELIVERABLE_KM = Number(import.meta.env.VITE_MAX_DELIVERABLE_KM || 15);
export const PLATFORM_FEE = Number(import.meta.env.VITE_PLATFORM_FEE || 0);
export const TAX_RATE = Number(import.meta.env.VITE_TAX_RATE || 0); // 0.05 = 5% GST

export const deliveryFeeForKm = (km) => {
  if (km == null) return null;
  for (const t of DELIVERY_TIERS) if (km <= t.max) return t.fee;
  return BEYOND_FEE;
};

export const isDeliverableKm = (km) => km != null && km <= MAX_DELIVERABLE_KM;

/**
 * Full checkout math. `deliveryCharge` should come from the live distance quote
 * when available; falls back to the km-based tier otherwise.
 */
export const computeCheckout = ({ productTotal, deliveryCharge, distanceKm }) => {
  const delivery = deliveryCharge != null ? deliveryCharge : deliveryFeeForKm(distanceKm) ?? 0;
  const platformFee = PLATFORM_FEE;
  const taxes = Math.round(productTotal * TAX_RATE);
  const grandTotal = productTotal + delivery + platformFee + taxes;
  return { productTotal, deliveryCharge: delivery, platformFee, taxes, grandTotal };
};
