import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star, Clock, MapPin, ShoppingBag, Leaf, Search, ChevronLeft, Store as StoreIcon,
} from "lucide-react";
import { useVendorBySlug } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "@/components/organisms/ProductGrid";
import EmptyState from "@/components/atoms/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { getDisplayName } from "@/lib/categories";

const StoreHeaderSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 md:h-60 w-full rounded-3xl" />
    <div className="space-y-3">
      <Skeleton className="h-7 w-64 rounded" />
      <Skeleton className="h-4 w-40 rounded" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  </div>
);

const InfoStat = ({ icon: Icon, label, value, accent = "text-[#D2691E]" }) => (
  <div className="flex-1 min-w-[80px] text-center px-3 py-2">
    <div className="flex items-center justify-center gap-1.5">
      <Icon className={`h-4 w-4 ${accent}`} />
      <span className="text-sm font-bold text-stone-900">{value}</span>
    </div>
    <p className="text-[10px] uppercase tracking-wider text-stone-400 mt-0.5">{label}</p>
  </div>
);

const StoreDetail = () => {
  const { slug } = useParams();
  const { data: vendor, isLoading: vendorLoading, isError } = useVendorBySlug(slug);
  const [query, setQuery] = useState("");

  const { data: productData, isLoading: productsLoading } = useProducts(
    { vendor: vendor?._id, limit: 200 },
    { enabled: !!vendor?._id },
  );

  const products = productData?.products || [];

  // Group by category, honoring the in-store search filter.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? products.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q),
        )
      : products;
    const map = new Map();
    for (const p of filtered) {
      const cat = p.category?.name || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }
    return Array.from(map.entries());
  }, [products, query]);

  if (vendorLoading) return <StoreHeaderSkeleton />;

  if (isError || !vendor) {
    return (
      <EmptyState
        icon="🏪"
        title="Store not found"
        description="This store may have moved or is no longer available."
        action={
          <Link to="/stores" className="text-sm font-semibold text-[#D2691E] hover:underline">
            ← Back to all stores
          </Link>
        }
      />
    );
  }

  const isFashion = vendor.storeType === "fashion";
  const accent = isFashion ? "text-[#9E2B5E]" : "text-[#D2691E]";
  const timingLabel = vendor.opensAt && vendor.closesAt ? `${vendor.opensAt} – ${vendor.closesAt}` : "All day";

  return (
    <div className="space-y-6">
      <Link to="/stores" className="inline-flex items-center gap-1 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
        <ChevronLeft className="h-4 w-4" /> All stores
      </Link>

      {/* Banner */}
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-stone-100">
        <img
          src={vendor.banner || vendor.logo || "https://placehold.co/1200x400?text=Store"}
          alt={vendor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/85 via-[#3E2723]/25 to-transparent" />
        <span
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur ${
            vendor.isOpen ? "bg-emerald-500/95 text-white" : "bg-stone-800/85 text-white"
          }`}
        >
          {vendor.isOpen ? "Open Now" : "Closed"}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 flex items-end gap-4">
          {vendor.logo && (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-elevated bg-white shrink-0">
              <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold text-white font-display leading-tight">{vendor.name}</h1>
            {vendor.tagline && <p className="text-sm text-white/70 mt-1 line-clamp-1">{vendor.tagline}</p>}
            {vendor.cuisines?.length > 0 && (
              <p className="text-xs text-white/60 mt-1 line-clamp-1">{vendor.cuisines.join(" · ")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="rounded-2xl border border-stone-200/70 bg-white shadow-soft divide-y sm:divide-y-0 sm:divide-x divide-stone-100 flex flex-col sm:flex-row">
        <InfoStat icon={Star} label="Rating" value={`${(vendor.averageRating || 0).toFixed(1)} (${vendor.totalReviews || 0})`} accent="text-emerald-600" />
        <InfoStat icon={Clock} label="Delivery" value={vendor.avgDeliveryTime || "30-40 min"} accent={accent} />
        <InfoStat icon={ShoppingBag} label="Min Order" value={formatPrice(vendor.minOrderValue || 0)} accent={accent} />
        <InfoStat icon={Clock} label="Timing" value={timingLabel} accent={accent} />
        {vendor.isPureVeg && <InfoStat icon={Leaf} label="Kitchen" value="Pure Veg" accent="text-emerald-600" />}
      </div>

      {/* Address */}
      {(vendor.address?.line1 || vendor.address?.city) && (
        <div className="flex items-start gap-2 text-sm text-stone-500">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-stone-400" />
          <span>
            {[vendor.address.line1, vendor.address.city, vendor.address.state, vendor.address.pincode].filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Menu */}
      <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
        <h2 className="text-xl font-bold text-stone-900 font-display flex items-center gap-2">
          <StoreIcon className={`h-5 w-5 ${accent}`} /> Menu
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in this store…"
            className="w-full h-10 pl-10 pr-4 text-sm rounded-2xl bg-stone-50 border border-stone-200 outline-none focus:bg-white focus:border-[#D2691E] focus:ring-2 focus:ring-[#D2691E]/20 transition-all"
          />
        </div>
      </div>

      {productsLoading ? (
        <ProductGrid isLoading />
      ) : grouped.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={query ? "No matches" : "No items yet"}
          description={query ? "Try a different search term." : "This store hasn't added any products yet."}
        />
      ) : (
        <div className="space-y-10">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-stone-900 font-display">{getDisplayName(category)}</h3>
                <span className="text-xs font-semibold text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <ProductGrid products={items} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
