// Persist the applied coupon code across the cart -> checkout handoff. Only the
// code is stored; the real discount is always re-derived server-side.
const KEY = "applied_coupon";

export const getAppliedCode = () => {
  try {
    return localStorage.getItem(KEY) || null;
  } catch {
    return null;
  }
};

export const setAppliedCode = (code) => {
  try {
    if (code) localStorage.setItem(KEY, code);
  } catch {
    /* ignore */
  }
};

export const clearAppliedCode = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};
