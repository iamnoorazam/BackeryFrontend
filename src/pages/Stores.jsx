import { useState } from "react";
import { Store, SlidersHorizontal } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import VendorGrid from "@/components/organisms/VendorGrid";

const SORTS = [
  { key: "", label: "Recommended" },
  { key: "rating", label: "Top Rated" },
  { key: "popular", label: "Most Popular" },
  { key: "newest", label: "Newest" },
];

const TYPES = [
  { key: "", label: "All" },
  { key: "food", label: "Food" },
  { key: "fashion", label: "Fashion" },
];

const Stores = () => {
  const [sort, setSort] = useState("");
  const [storeType, setStoreType] = useState("");

  const { data, isLoading } = useVendors({
    sort: sort || undefined,
    storeType: storeType || undefined,
    limit: 24,
  });

  const vendors = data?.vendors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E2723] via-[#4E342E] to-[#3E2723] px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-[#D2691E]/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 bg-[#9E2B5E]/15 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#FFD9A0] font-semibold mb-2">
            <Store className="h-3.5 w-3.5" /> Marketplace
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display">Explore Stores</h1>
          <p className="text-sm text-white/60 mt-2 max-w-lg">
            Discover bakeries, kitchens and boutiques near you — freshly baked treats and handpicked fashion, all in one place.
          </p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setStoreType(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              storeType === t.key
                ? "bg-[#3E2723] text-white border-[#3E2723]"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-stone-500">
          {isLoading ? "Loading stores…" : `${vendors.length} store${vendors.length === 1 ? "" : "s"}`}
        </p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <SlidersHorizontal className="h-4 w-4 text-stone-400 shrink-0" />
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                sort === s.key
                  ? "bg-[#FFF8F0] text-[#D2691E] border-[#D2691E]/40"
                  : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <VendorGrid vendors={vendors} isLoading={isLoading} />
    </div>
  );
};

export default Stores;
