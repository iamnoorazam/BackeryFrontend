// Buy Now express-checkout state. Kept in sessionStorage so a page refresh in
// the middle of checkout never loses the selected product or the entered
// shipping details. This is intentionally separate from the shopping cart so a
// "Buy Now" purchase doesn't disturb whatever the user already has in the cart.

const ITEM_KEY = "buyNowItem";
const SHIP_KEY = "buyNowShipping";
const QUOTE_KEY = "buyNowQuote";

const read = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
};

export const setBuyNowItem = (item) => sessionStorage.setItem(ITEM_KEY, JSON.stringify(item));
export const getBuyNowItem = () => read(ITEM_KEY);

export const setBuyNowShipping = (shipping) =>
  sessionStorage.setItem(SHIP_KEY, JSON.stringify(shipping));
export const getBuyNowShipping = () => read(SHIP_KEY) || {};

// Distance quote + coordinates, so the delivery charge/ETA survive refresh and
// carry into the payment step.
export const setBuyNowQuote = (quote) =>
  quote ? sessionStorage.setItem(QUOTE_KEY, JSON.stringify(quote)) : sessionStorage.removeItem(QUOTE_KEY);
export const getBuyNowQuote = () => read(QUOTE_KEY);

export const clearBuyNow = () => {
  sessionStorage.removeItem(ITEM_KEY);
  sessionStorage.removeItem(SHIP_KEY);
  sessionStorage.removeItem(QUOTE_KEY);
};

/** Snapshot the fields the checkout page needs from a product + chosen variant. */
export const buildBuyNowItem = (product, variant, quantity = 1) => ({
  productId: product._id,
  name: product.name,
  image: product.images?.[0] || "",
  price: variant?.price ?? product.price ?? 0,
  originalPrice: variant?.originalPrice ?? product.originalPrice ?? null,
  size: variant?.name || null,
  color: product.selectedColor || variant?.color || null,
  quantity: Math.max(1, quantity || 1),
  categoryName: product.category?.name || "",
});

/** Order-summary math (Flipkart-style: MRP, discount, delivery, total). */
export const computeBuyNowTotals = (item) => {
  const qty = Math.max(1, item?.quantity || 1);
  const price = item?.price || 0;
  const mrp = item?.originalPrice && item.originalPrice > price ? item.originalPrice : price;
  const listTotal = mrp * qty; // pre-discount
  const payable = price * qty; // after item discount
  const discount = listTotal - payable;
  const FREE_DELIVERY_ABOVE = 299;
  const delivery = payable >= FREE_DELIVERY_ABOVE ? 0 : 40;
  const total = payable + delivery;
  return { qty, price, mrp, listTotal, payable, discount, delivery, total };
};

/** Turn the shipping form into the backend order payload. */
export const buildOrderPayload = (shipping, paymentMethod, coordinates) => {
  const line1 = [shipping.house, shipping.street].filter(Boolean).join(", ");
  const fullAddress = [
    line1,
    shipping.landmark,
    `${shipping.city}, ${shipping.state} ${shipping.pincode}`,
    "India",
  ]
    .filter(Boolean)
    .join(", ");
  return {
    customerName: shipping.fullName,
    customerEmail: shipping.email,
    customerPhone: shipping.mobile,
    paymentMethod,
    sameAsShipping: true,
    deliveryAddress: {
      line1,
      line2: shipping.landmark || "",
      city: shipping.city,
      state: shipping.state,
      postalCode: shipping.pincode,
      country: "IN",
      fullAddress,
      // Sending coordinates lets the backend price delivery by real distance,
      // matching the quote shown at checkout.
      ...(coordinates?.lat != null ? { coordinates } : {}),
    },
  };
};
