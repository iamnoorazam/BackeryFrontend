import { Link } from "react-router-dom";
import { Star, Clock, MapPin, Leaf, BadgeCheck, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

/**
 * Marketplace store card (Phase 2, Module 2). Consumes the public vendor shape
 * returned by GET /vendors. Accent adapts to the store type (food vs fashion)
 * to match the rest of the Saffron & Silk brand system.
 */
const VendorCard = ({ vendor, staggerIndex = 0 }) => {
  if (!vendor) return null;

  const isFashion = vendor.storeType === "fashion";
  const accent = isFashion
    ? { text: "group-hover:text-[#9E2B5E]", border: "hover:border-[#9E2B5E]/30", ring: "ring-[#9E2B5E]/20" }
    : { text: "group-hover:text-primary", border: "hover:border-[#D2691E]/30", ring: "ring-[#D2691E]/20" };

  const rating = vendor.averageRating || 0;
  const cuisines = (vendor.cuisines || []).slice(0, 3).join(" · ");
  const open = vendor.isOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: staggerIndex * 0.05, ease: "easeOut" }}
    >
      <Link
        to={`/store/${vendor.slug}`}
        className={`group block bg-card rounded-2xl border border-border/70 overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 ${accent.border}`}
      >
        {/* Banner */}
        <div className="relative h-40 overflow-hidden bg-muted">
          <img
            src={vendor.banner || vendor.logo || "https://placehold.co/600x300?text=Store"}
            alt={vendor.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${open ? "" : "grayscale-[35%]"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/75 via-[#3E2723]/10 to-transparent" />

          {/* Promoted / Featured */}
          {vendor.isPromoted && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-card/90 text-foreground shadow-sm backdrop-blur">
              Promoted
            </span>
          )}

          {/* Open / Closed */}
          <span
            className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur ${
              open ? "bg-success text-white" : "bg-foreground/85 text-background"
            }`}
          >
            {open ? "Open" : "Closed"}
          </span>

          {/* Delivery time chip */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur text-[11px] font-bold text-foreground shadow-sm">
            <Clock className="h-3 w-3 text-primary" />
            {vendor.avgDeliveryTime || "30-40 min"}
          </div>

          {/* Logo badge */}
          {vendor.logo && (
            <div className={`absolute -bottom-5 right-3 w-12 h-12 rounded-2xl overflow-hidden border-2 border-card shadow-elevated ring-2 ${accent.ring} bg-card`}>
              <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 pt-3.5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-bold text-foreground leading-tight text-base line-clamp-1 transition-colors ${accent.text}`}>
              {vendor.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md bg-success-subtle">
              <Star className="h-3 w-3 fill-success text-success" />
              <span className="text-[11px] font-bold text-success">{rating.toFixed(1)}</span>
            </div>
          </div>

          {cuisines && (
            <p className="text-xs text-muted-foreground/70 line-clamp-1 leading-relaxed">{cuisines}</p>
          )}

          <div className="flex items-center gap-3 pt-1.5 text-[11px] text-muted-foreground border-t border-border">
            <span className="flex items-center gap-1 pt-2">
              <ShoppingBag className="h-3 w-3 text-muted-foreground/70" />
              Min {formatPrice(vendor.minOrderValue || 0)}
            </span>
            {vendor.distanceKm != null && (
              <span className="flex items-center gap-1 pt-2">
                <MapPin className="h-3 w-3 text-muted-foreground/70" />
                {vendor.distanceKm} km
              </span>
            )}
            {vendor.isPureVeg && (
              <span className="flex items-center gap-1 pt-2 text-success font-semibold ml-auto">
                <Leaf className="h-3 w-3" /> Pure Veg
              </span>
            )}
            {!vendor.isPureVeg && vendor.totalReviews > 0 && (
              <span className="flex items-center gap-1 pt-2 ml-auto text-muted-foreground/70">
                <BadgeCheck className="h-3 w-3" /> {vendor.totalReviews} reviews
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VendorCard;
