import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const getStatusColor = (status) => {
  const colors = {
    placed: "bg-blue-100 text-blue-700",
    accepted: "bg-yellow-100 text-yellow-700",
    preparing: "bg-orange-100 text-orange-700",
    out_for_delivery: "bg-purple-100 text-purple-700",
    waiting_for_otp: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};
