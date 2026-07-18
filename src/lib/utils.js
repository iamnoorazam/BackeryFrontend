import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Theme-aware status pills. Uses semantic chip utilities (defined in index.css)
// so order/payment statuses stay legible in both light and dark themes.
export const getStatusColor = (status) => {
  const colors = {
    placed: "chip-info",
    accepted: "chip-warning",
    preparing: "chip-warning",
    out_for_delivery: "chip-info",
    waiting_for_otp: "chip-info",
    delivered: "chip-success",
    cancelled: "chip-danger",
    paid: "chip-success",
    pending: "chip-warning",
    failed: "chip-danger",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};
