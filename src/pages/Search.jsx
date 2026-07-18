import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon, X, Clock, TrendingUp, Leaf, Tag, Star, Store, UtensilsCrossed, LayoutGrid,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useVendors } from "@/hooks/useVendors";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce, useTrending } from "@/hooks/useSearch";
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from "@/lib/recentSearches";
import { getDisplayName } from "@/lib/categories";
import ProductGrid from "@/components/organisms/ProductGrid";
import VendorGrid from "@/components/organisms/VendorGrid";
import EmptyState from "@/components/atoms/EmptyState";

const SORTS = [
  { key: "", label: "Relevance" },
  { key: "popular", label: "Popular" },
  { key: "rating", label: "Rating" },
  { key: "price_low", label: "Price ↑" },
  { key: "price_high", label: "Price ↓" },
];

const FilterChip = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
      active
        ? "bg-[#FFF8F0] text-[#D2691E] border-[#D2691E]/40"
        : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
    }`}
  >
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </button>
);

const Search = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = params.get("q") || "";

  const [input, setInput] = useState(urlQuery);
  const debounced = useDebounce(input.trim(), 350);
  const hasQuery = debounced.length >= 1;

  const [recent, setRecent] = useState(getRecentSearches());
  const [tab, setTab] = useState("all"); // all | stores | dishes
  const [vegOnly, setVegOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [sort, setSort] = useState("");

  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Keep the URL in sync with the debounced query (shareable, back-button friendly).
  useEffect(() => {
    if (debounced === urlQuery) return;
    const next = new URLSearchParams(params);
    if (debounced) next.set("q", debounced);
    else next.delete("q");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data: trending } = useTrending();
  const { data: categories } = useCategories();

  const { data: productData, isLoading: productsLoading } = useProducts(
    {
      search: debounced,
      isVeg: vegOnly ? "true" : undefined,
      offersOnly: offersOnly ? "true" : undefined,
      minRating: topRated ? 4 : undefined,
      sort: sort || undefined,
      limit: 24,
    },
    { enabled: hasQuery },
  );

  const { data: vendorData, isLoading: vendorsLoading } = useVendors(
    { search: debounced, limit: 24 },
    { enabled: hasQuery },
  );

  const products = productData?.products || [];
  const vendors = vendorData?.vendors || [];

  const matchedCategories = useMemo(() => {
    if (!hasQuery || !categories) return [];
    const q = debounced.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || getDisplayName(c.name).toLowerCase().includes(q),
    );
  }, [categories, debounced, hasQuery]);

  const commit = (term) => {
    const t = String(term).trim();
    if (!t) return;
    setInput(t);
    setRecent(addRecentSearch(t));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    commit(input);
    inputRef.current?.blur();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search bar */}
      <form onSubmit={onSubmit} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for stores, dishes or cuisines…"
          className="w-full h-14 pl-12 pr-12 text-base rounded-2xl bg-white border border-stone-200 shadow-soft outline-none focus:border-[#D2691E] focus:ring-2 focus:ring-[#D2691E]/20 transition-all"
        />
        {input && (
          <button
            type="button"
            onClick={() => { setInput(""); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Clear"
          >
            <X className="h-4 w-4 text-stone-400" />
          </button>
        )}
      </form>

      {/* ===== Empty state: recent + trending ===== */}
      {!hasQuery && (
        <div className="space-y-8">
          {recent.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-stone-700">
                  <Clock className="h-4 w-4 text-stone-400" /> Recent Searches
                </h2>
                <button
                  onClick={() => setRecent(clearRecentSearches())}
                  className="text-xs font-semibold text-stone-400 hover:text-[#D2691E] transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <span
                    key={term}
                    className="group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    <button onClick={() => commit(term)} className="font-medium">{term}</button>
                    <button
                      onClick={() => setRecent(removeRecentSearch(term))}
                      className="p-0.5 rounded-full hover:bg-stone-300/60 transition-colors"
                      aria-label={`Remove ${term}`}
                    >
                      <X className="h-3 w-3 text-stone-400 group-hover:text-stone-600" />
                    </button>
                  </span>
                ))}
              </div>
            </section>
          )}

          {trending?.terms?.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-3">
                <TrendingUp className="h-4 w-4 text-[#D2691E]" /> Trending Now
              </h2>
              <div className="flex flex-wrap gap-2">
                {trending.terms.map((term) => (
                  <button
                    key={term}
                    onClick={() => commit(term)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium bg-white border border-stone-200 text-stone-600 hover:border-[#D2691E]/40 hover:text-[#D2691E] transition-all"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-[#D2691E]" /> {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          {categories?.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-3">
                <LayoutGrid className="h-4 w-4 text-stone-400" /> Browse Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.name?.toLowerCase()}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-stone-200/70 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FFF8F0] shrink-0">
                      {cat.image ? (
                        <img src={cat.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#D2691E]"><Store className="h-5 w-5" /></div>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-stone-800 truncate">{getDisplayName(cat.name)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ===== Results ===== */}
      {hasQuery && (
        <div className="space-y-5">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200">
            {[
              { key: "all", label: "All", icon: LayoutGrid },
              { key: "stores", label: `Stores${vendors.length ? ` (${vendors.length})` : ""}`, icon: Store },
              { key: "dishes", label: `Dishes${productData?.total ? ` (${productData.total})` : ""}`, icon: UtensilsCrossed },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  tab === t.key ? "border-[#D2691E] text-[#D2691E]" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Filters (dishes) */}
          {tab !== "stores" && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <FilterChip active={vegOnly} onClick={() => setVegOnly((v) => !v)} icon={Leaf}>Pure Veg</FilterChip>
              <FilterChip active={offersOnly} onClick={() => setOffersOnly((v) => !v)} icon={Tag}>Offers</FilterChip>
              <FilterChip active={topRated} onClick={() => setTopRated((v) => !v)} icon={Star}>Rating 4.0+</FilterChip>
              <span className="w-px h-5 bg-stone-200 mx-1 shrink-0" />
              {SORTS.map((s) => (
                <FilterChip key={s.key} active={sort === s.key} onClick={() => setSort(s.key)}>{s.label}</FilterChip>
              ))}
            </div>
          )}

          {/* Stores section */}
          {(tab === "all" || tab === "stores") && (
            <section>
              {tab === "all" && (
                <h3 className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-3">
                  <Store className="h-4 w-4 text-[#D2691E]" /> Stores
                </h3>
              )}
              {tab === "stores" ? (
                <VendorGrid vendors={vendors} isLoading={vendorsLoading} emptyTitle="No stores match" emptyDescription={`Nothing found for "${debounced}".`} />
              ) : (
                vendors.length > 0 && <VendorGrid vendors={vendors.slice(0, 3)} isLoading={vendorsLoading} />
              )}
            </section>
          )}

          {/* Matched categories (all tab only) */}
          {tab === "all" && matchedCategories.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-3">
                <LayoutGrid className="h-4 w-4 text-stone-400" /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchedCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.name?.toLowerCase()}`}
                    className="px-3.5 py-2 rounded-full text-sm font-semibold bg-white border border-stone-200 text-stone-600 hover:border-[#D2691E]/40 hover:text-[#D2691E] transition-all"
                  >
                    {getDisplayName(cat.name)}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Dishes section */}
          {(tab === "all" || tab === "dishes") && (
            <section>
              {tab === "all" && (
                <h3 className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-3">
                  <UtensilsCrossed className="h-4 w-4 text-[#D2691E]" /> Dishes
                </h3>
              )}
              <ProductGrid products={products} isLoading={productsLoading} />
            </section>
          )}

          {/* Global empty (all tab, nothing anywhere) */}
          {tab === "all" && !productsLoading && !vendorsLoading && products.length === 0 && vendors.length === 0 && matchedCategories.length === 0 && (
            <EmptyState
              icon="🔍"
              title={`No results for "${debounced}"`}
              description="Try a different keyword, or browse all stores."
              action={<Link to="/stores" className="text-sm font-semibold text-[#D2691E] hover:underline">Explore stores →</Link>}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
