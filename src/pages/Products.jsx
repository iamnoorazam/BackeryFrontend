import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, Store, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProductGrid from "@/components/organisms/ProductGrid";
import FadeInSection from "@/components/atoms/FadeInSection";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const category = searchParams.get("category") || "";

  const { data, isLoading } = useProducts({ search, category, limit: 20 });
  const { data: categories } = useCategories();

  const activeCategory = useMemo(() => {
    if (!category || !categories) return null;
    return categories.find((c) => c._id === category);
  }, [category, categories]);

  const setCategory = (id) => {
    const params = new URLSearchParams(searchParams);
    id ? params.set("category", id) : params.delete("category");
    setSearchParams(params);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <FadeInSection>
        <div className="animate-fade-up">
          {activeCategory ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon-sm" className="shrink-0" asChild>
                <Link to="/products">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{activeCategory.name}</h1>
                </div>
                <p className="text-sm text-stone-400 mt-0.5">{data?.total ?? 0} products available</p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900">Our Menu</h1>
              <p className="text-sm text-stone-400 mt-1">{data?.total ?? 0} products available</p>
            </div>
          )}
        </div>
      </FadeInSection>

      {/* Search & Filters */}
      <FadeInSection delay={100}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <Input
              className="pl-10 h-11 bg-white rounded-2xl"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <Badge
              variant={!category ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2 text-xs rounded-xl whitespace-nowrap transition-all hover:scale-105"
              onClick={() => setCategory("")}
            >
              All
            </Badge>
            {categories?.map((cat) => (
              <Badge
                key={cat._id}
                variant={category === cat._id ? "default" : "secondary"}
                className="cursor-pointer px-4 py-2 text-xs rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all hover:scale-105"
                onClick={() => setCategory(cat._id)}
              >
                <Store className="h-3 w-3" />
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* Category Banner */}
      {activeCategory && activeCategory.image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden h-44 md:h-56"
        >
          <img
            src={activeCategory.image}
            alt={activeCategory.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
            <div className="p-6 md:p-8 text-white max-w-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-1">{activeCategory.name}</h2>
              <p className="text-white/80 text-sm">{activeCategory.description || `Explore our ${activeCategory.name} collection`}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Grid */}
      <FadeInSection delay={200}>
        <ProductGrid products={data?.products} isLoading={isLoading} />
      </FadeInSection>
    </div>
  );
};

export default Products;
