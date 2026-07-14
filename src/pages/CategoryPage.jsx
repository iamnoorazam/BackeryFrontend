import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Search, SlidersHorizontal, ChevronDown,
  Sparkles, Heart, Flame, Clock, Award, TrendingUp,
  Star, ShoppingCart, Eye, Filter, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/molecules/ProductCard";
import Spinner from "@/components/atoms/Spinner";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

const categoryMeta = {
  Cake: {
    icon: "🎂", gradient: "from-pink-600 to-rose-700",
    desc: "Sweeten Your Moments with Delicious Cakes",
    longDesc: "Birthday cakes, chocolate cakes, fruit cakes, pastries and more made fresh for every celebration.",
    cta: "Order Cake Now",
  },
  Burger: {
    icon: "🍔", gradient: "from-amber-600 to-orange-700",
    desc: "Juicy Burgers for Every Craving",
    longDesc: "Cheesy, crispy, spicy, loaded burgers made fresh and delivered fast.",
    cta: "Order Burger Now",
  },
  Pizza: {
    icon: "🍕", gradient: "from-orange-600 to-red-700",
    desc: "Authentic Wood-Fired Pizzas",
    longDesc: "Freshly baked pizzas with premium toppings, cheese burst crusts & combo deals.",
    cta: "Order Pizza Now",
  },
  Momos: {
    icon: "🥟", gradient: "from-emerald-600 to-teal-700",
    desc: "Steamed & Fried Momos for Every Mood",
    longDesc: "Veg, chicken, paneer, tandoori, schezwan momos served with spicy dips.",
    cta: "Order Momos Now",
  },
  Biryani: {
    icon: "🍚", gradient: "from-yellow-600 to-orange-700",
    desc: "Fragrant Biryani Made with Love",
    longDesc: "Chicken, mutton, veg, egg biryani — slow-cooked with aromatic spices.",
    cta: "Order Biryani Now",
  },
  Coldrink: {
    icon: "🥤", gradient: "from-sky-600 to-cyan-700",
    desc: "Chilled Drinks to Beat the Heat",
    longDesc: "Soft drinks, shakes, juices, mocktails & refreshing beverages for every thirst.",
    cta: "Order Drinks Now",
  },
  "Egg Rolls": {
    icon: "🌯", gradient: "from-red-600 to-rose-700",
    desc: "Crispy Egg Rolls with Spicy Fillings",
    longDesc: "Classic, double egg, chicken, paneer, cheese rolls with chutney dips.",
    cta: "Order Rolls Now",
  },
  Fruit: {
    icon: "🍇", gradient: "from-green-600 to-emerald-700",
    desc: "Fresh & Juicy Fruits for a Healthy Life",
    longDesc: "Handpicked apples, mangoes, bananas, oranges, grapes & more — farm-fresh and full of natural sweetness.",
    cta: "Order Fruits Now",
  },
};

const displayNames = {
  Cake: "Cakes",
  Burger: "Burgers",
  Pizza: "Pizza",
  Momos: "Momos",
  Biryani: "Biryani",
  Coldrink: "Cold Drinks",
  "Egg Rolls": "Egg Rolls",
  Fruit: "Fruits",
};

const moodCategories = [
  { mood: "Feeling Hungry?", emoji: "🤤", cats: ["Biryani", "Burger", "Pizza"], gradient: "from-orange-500 to-red-500" },
  { mood: "Want Something Light?", emoji: "🥗", cats: ["Momos", "Egg Rolls", "Coldrink"], gradient: "from-green-500 to-emerald-500" },
  { mood: "Celebration Mood?", emoji: "🎉", cats: ["Cake", "Coldrink"], gradient: "from-pink-500 to-purple-500" },
  { mood: "Late Night Cravings?", emoji: "🌙", cats: ["Pizza", "Burger", "Biryani"], gradient: "from-indigo-500 to-purple-500" },
  { mood: "Spicy Mood?", emoji: "🌶️", cats: ["Momos", "Burger", "Biryani"], gradient: "from-red-600 to-orange-500" },
  { mood: "Sweet Tooth?", emoji: "🍬", cats: ["Cake", "Coldrink"], gradient: "from-pink-400 to-rose-500" },
  { mood: "Healthy Craving?", emoji: "🥗", cats: ["Fruit"], gradient: "from-green-500 to-emerald-500" },
  { mood: "Beat the Heat?", emoji: "🍉", cats: ["Fruit", "Coldrink"], gradient: "from-teal-500 to-cyan-500" },
];

const CategoryPage = () => {
  const { categoryName } = useParams();
  const { data: categories, isLoading: catLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [isVegFilter, setIsVegFilter] = useState(null);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const category = categories?.find(
    (c) => c.name?.toLowerCase() === categoryName?.toLowerCase()
  );

  const meta = category ? categoryMeta[category.name] : null;
  const displayName = category ? (displayNames[category.name] || category.name) : "Category";

  const params = useMemo(() => {
    const p = {};
    if (category) p.category = category._id;
    if (searchTerm) p.search = searchTerm;
    if (isVegFilter !== null) p.isVeg = isVegFilter;
    p.sort = sortBy;
    p.limit = 50;
    return p;
  }, [category?._id, searchTerm, isVegFilter, sortBy]);

  const { data, isLoading } = useProducts(
    params,
    { enabled: !!category }
  );

  const products = data?.products || [];

  const bestSellers = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 6),
    [products]
  );

  const offers = useMemo(
    () => products.filter((p) => p.discount > 0).slice(0, 6),
    [products]
  );

  const combos = useMemo(
    () => products.filter((p) => p.tags?.includes("Combo Deal") || p.isCombo).slice(0, 6),
    [products]
  );

  const favorites = useMemo(
    () => [...products].sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0)).slice(0, 6),
    [products]
  );

  const chefsSpecial = useMemo(
    () => products.filter((p) => p.tags?.includes("Chef's Special")).slice(0, 4),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }
    if (isVegFilter !== null) {
      result = result.filter((p) => p.isVeg === isVegFilter);
    }
    switch (sortBy) {
      case "price_low": result.sort((a, b) => a.price - b.price); break;
      case "price_high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)); break;
      case "popular": result.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0)); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break;
    }
    return result;
  }, [products, searchTerm, isVegFilter, sortBy]);

  if (catLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-24 animate-fade-in max-w-lg mx-auto">
        <span className="text-6xl mb-4 block">🔍</span>
        <p className="text-2xl font-bold text-stone-900 mb-2">Category not found</p>
        <p className="text-stone-500 mb-8">No category matching &ldquo;{categoryName}&rdquo; was found.</p>
        <Button asChild className="bg-stone-900 text-white hover:bg-stone-800">
          <Link to="/products">Browse all products</Link>
        </Button>
      </div>
    );
  }

  const moodForThisCat = moodCategories.filter((m) => m.cats.includes(category.name));

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      {/* ===== HERO BANNER ===== */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${meta?.gradient || "from-stone-800 to-stone-900"}`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 p-8 md:p-14">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white -ml-2">
                <Link to="/products">
                  <ArrowLeft className="h-4 w-4 mr-1" /> All Products
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl md:text-6xl">{meta?.icon || "🍽️"}</span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {displayName}
              </h1>
            </div>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl">
              {meta?.desc || "Delicious food"}
            </p>
            <p className="text-white/60 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
              {meta?.longDesc || category?.description || "Browse our delicious selection"}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Button className="bg-white text-stone-900 hover:bg-stone-100 border-0 shadow-xl font-bold px-6 py-5 text-sm rounded-xl">
                {meta?.cta || "Order Now"} <ShoppingCart className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl px-5 py-5 text-sm" asChild>
                <Link to={`/products?category=${category._id}`}>View All Items</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-white/50 text-sm">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.8</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" /> {products.length} Items</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 20-30 min</span>
            </div>

            {/* Search Bar */}
            <div className="mt-6 max-w-md">
              <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden focus-within:bg-white/20 focus-within:border-white/40 transition-all">
                <Search className="h-4 w-4 text-white/50 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder={`Search in ${displayName}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none w-full"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="pr-3 text-white/50 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {category?.image && (
            <div className="shrink-0 w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== MOOD-BASED RECOMMENDATIONS ===== */}
      {moodForThisCat.length > 0 && !searchTerm && isVegFilter === null && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold text-stone-900">What's Your Mood?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {moodForThisCat.map((m) => (
              <Link
                key={m.mood}
                to={`/category/${m.cats[0]?.toLowerCase()}`}
                className={`bg-gradient-to-r ${m.gradient} rounded-xl p-4 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
              >
                <span className="text-2xl block mb-2">{m.emoji}</span>
                <p className="text-sm font-bold leading-tight">{m.mood}</p>
                <p className="text-[10px] text-white/70 mt-1">{m.cats.join(" • ")}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ===== FILTER & SORT BAR ===== */}
      <div className="animate-slide-up">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-stone-200 text-stone-600 hover:text-stone-900 gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>

            <div className="flex gap-1">
              <Badge
                variant={isVegFilter === null ? "default" : "secondary"}
                className="cursor-pointer px-3 py-1.5 text-xs"
                onClick={() => setIsVegFilter(null)}
              >
                All
              </Badge>
              <Badge
                variant={isVegFilter === true ? "default" : "secondary"}
                className={`cursor-pointer px-3 py-1.5 text-xs ${isVegFilter === true ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => setIsVegFilter(isVegFilter === true ? null : true)}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-1" /> Veg
              </Badge>
              <Badge
                variant={isVegFilter === false ? "default" : "secondary"}
                className={`cursor-pointer px-3 py-1.5 text-xs ${isVegFilter === false ? "bg-red-600 hover:bg-red-700" : ""}`}
                onClick={() => setIsVegFilter(isVegFilter === false ? null : false)}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-1" /> Non-Veg
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 outline-none focus:border-orange-300 transition-colors"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Best Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200 animate-scale-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="text-xs px-3 py-2 rounded-lg bg-white border border-stone-200 hover:border-orange-300 text-stone-600 hover:text-orange-600 transition-all font-medium">
                🔥 Offers
              </button>
              <button className="text-xs px-3 py-2 rounded-lg bg-white border border-stone-200 hover:border-orange-300 text-stone-600 hover:text-orange-600 transition-all font-medium">
                ⭐ Best Rated
              </button>
              <button className="text-xs px-3 py-2 rounded-lg bg-white border border-stone-200 hover:border-orange-300 text-stone-600 hover:text-orange-600 transition-all font-medium">
                🆕 New Arrivals
              </button>
              <button className="text-xs px-3 py-2 rounded-lg bg-white border border-stone-200 hover:border-orange-300 text-stone-600 hover:text-orange-600 transition-all font-medium">
                🚀 Fast Delivery
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== BEST SELLERS ===== */}
      {bestSellers.length > 0 && !searchTerm && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold text-stone-900">Best Selling {displayName}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {bestSellers.map((product, idx) => (
              <ProductCard key={product._id} product={product} staggerIndex={idx} />
            ))}
          </div>
        </div>
      )}

      {/* ===== TODAY'S OFFERS ===== */}
      {offers.length > 0 && !searchTerm && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <Flame className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-stone-900">Today's Offers 🔥</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {offers.map((product, idx) => (
              <ProductCard key={product._id} product={product} staggerIndex={idx} />
            ))}
          </div>
        </div>
      )}

      {/* ===== COMBO MEALS ===== */}
      {combos.length > 0 && !searchTerm && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <Award className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-bold text-stone-900">Combo Meals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {combos.map((product, idx) => (
              <ProductCard key={product._id} product={product} staggerIndex={idx} />
            ))}
          </div>
        </div>
      )}

      {/* ===== CHEF'S SPECIAL ===== */}
      {chefsSpecial.length > 0 && !searchTerm && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-stone-900">Chef's Special</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {chefsSpecial.map((product, idx) => (
              <ProductCard key={product._id} product={product} staggerIndex={idx} />
            ))}
          </div>
        </div>
      )}

      {/* ===== CUSTOMER FAVORITES ===== */}
      {favorites.length > 0 && !searchTerm && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <Heart className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-stone-900">Customer Favorites ❤️</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {favorites.map((product, idx) => (
              <ProductCard key={product._id} product={product} staggerIndex={idx} />
            ))}
          </div>
        </div>
      )}

      {/* ===== FULL MENU GRID ===== */}
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold text-stone-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : `All ${displayName}`}
            </h2>
            <span className="text-sm text-stone-400">({filteredProducts.length} items)</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
            <Search className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-lg font-medium">No products found</p>
            <p className="text-stone-400 text-sm mt-1">Try adjusting your search or filter</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setSearchTerm(""); setIsVegFilter(null); setSortBy("popular"); }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product._id} product={product} staggerIndex={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
