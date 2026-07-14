import { useRef, useCallback, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, CakeSlice, Pizza, Beef, Soup, CookingPot, CupSoda, ChefHat,
  Sparkles, ChevronRight, Star, Clock, Shield, Truck, Heart,
  Quote, BadgeCheck, ShoppingBag, MapPin, ArrowUp,
  Search, Phone, Zap, Award, Flame, MessageCircle,
  Store, Users, TrendingUp, Timer
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductGrid from "@/components/organisms/ProductGrid";
import ProductCard from "@/components/molecules/ProductCard";
import FadeInSection from "@/components/atoms/FadeInSection";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { productApi } from "@/api/product.api";

const displayNames = {
  Cake: "Cakes", Burger: "Burgers", Pizza: "Pizza", Momos: "Momos",
  Biryani: "Biryani", Coldrink: "Cold Drinks", "Egg Rolls": "Egg Rolls", Fruit: "Fruits",
};

const categoryIcons = {
  Cake: CakeSlice, Burger: Beef, Pizza, Momos: Soup, Biryani: CookingPot, Coldrink: CupSoda,
  "Egg Rolls": ChefHat, Fruit: Soup,
};
const defaultIcon = Pizza;

const testimonials = [
  { text: "The red velvet cake was absolutely divine, and the biryani is a must-try. Five stars all the way!", name: "Priya Sharma", role: "Regular Customer", rating: 5, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80" },
  { text: "Best delivery experience. Pizza arrived hot, burger was juicy, and the momos were perfection.", name: "Rahul Mehta", role: "Food Enthusiast", rating: 5, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" },
  { text: "Finally a service that delivers on quality. Fresh ingredients, great taste, always on time.", name: "Anita Kapoor", role: "Home Baker", rating: 5, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80" },
  { text: "Ordered for a party and everyone raved. The cakes are divine and the pizzas are loaded!", name: "Vikram Joshi", role: "Event Planner", rating: 5, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80" },
];

const perks = [
  { icon: Heart, title: "Made with Love", desc: "Every item is handcrafted with premium ingredients and utmost care." },
  { icon: Truck, title: "Free Delivery", desc: "Free delivery on orders above ₹299. Hot & fresh, right to your door." },
  { icon: Shield, title: "Quality Guaranteed", desc: "100% satisfaction guaranteed. Not happy? We'll make it right." },
  { icon: Clock, title: "Always Fresh", desc: "Baked fresh every morning. We never sell day-old products." },
];

const steps = [
  {
    step: "01", icon: ShoppingBag, title: "Browse & Order",
    desc: "Explore our menu of freshly baked goods, burgers, pizzas, biryani, and more. Add your favourites to the cart.",
  },
  {
    step: "02", icon: ChefHat, title: "We Prepare Fresh",
    desc: "Every order is made fresh with premium ingredients. Our chefs prepare your food with love and care.",
  },
  {
    step: "03", icon: Truck, title: "Quick Delivery",
    desc: "Our delivery partners bring your order straight to your door. Hot, fresh, and on time — every time.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimatedSection({ children, className, delay = 0, ...props }) {
  const [ref, inView] = useInView(0.1);
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className || ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </section>
  );
}

function CountUp({ end, duration = 2000, suffix = "", star = false, decimals = 0 }) {
  const [ref, inView] = useInView(0.3);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);
  const display = decimals > 0 ? (count / Math.pow(10, decimals)).toFixed(decimals) : count;
  return (
    <span ref={ref} className="flex items-center justify-center gap-1">
      {display}{suffix}
      {star && <Star className="h-4 md:h-5 w-4 md:w-5 fill-amber-400 text-amber-400" />}
    </span>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: productData, isLoading: allLoading } = useProducts({ limit: 8 });
  const [searchQuery, setSearchQuery] = useState("");

  const categoryQueries = useQueries({
    queries: (categories || []).slice(0, 3).map((cat) => ({
      queryKey: ["products", "category", cat._id],
      queryFn: () => productApi.getAll({ category: cat._id, limit: 8 }).then((r) => r.data.data),
    })),
  });

  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);
  const heroRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTestimonial = useCallback((i) => { setTestimonialIdx(i); }, []);

  const onTouchStart = useCallback((e) => { touchStartX.current = e.touches[0].clientX; }, []);
  const onTouchEnd = useCallback((e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTestimonial(diff > 0 ? (testimonialIdx + 1) % testimonials.length : (testimonialIdx - 1 + testimonials.length) % testimonials.length);
    }
  }, [testimonialIdx, goTestimonial]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden rounded-3xl mb-12 md:mb-16"
      >
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=1920&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Badge variant="premium" className="mb-5 md:mb-6 text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 tracking-wider uppercase shadow-lg shadow-orange-500/30">
              <Flame className="h-3 md:h-3.5 w-3 md:w-3.5 mr-1.5 fill-white" />
              Free Delivery on orders above ₹299
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-[2.2rem] sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 md:mb-6 leading-[1.1] text-balance"
          >
            <span className="text-white">Your Favourite </span>
            <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 bg-clip-text text-transparent">
              Food
            </span>
            <br className="sm:hidden" />
            <span className="text-white"> Delivered{" "}
              <span className="relative inline-block">
                <span className="text-white">Hot & Fresh</span>
                <span className="absolute -bottom-1 left-0 right-0 h-2 md:h-3 bg-gradient-to-r from-orange-500/40 to-amber-500/40 rounded-full blur-md" />
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-white/50 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed px-2 text-balance"
          >
            From our oven to your doorstep — handcrafted cakes, smoky burgers, wood-fired pizzas,
            steamy momos & aromatic biryani. Pure love in every bite.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            onSubmit={handleSearch}
            className="max-w-xl mx-auto mb-6 md:mb-8"
          >
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 focus-within:border-orange-400/60 focus-within:bg-white/[0.12] transition-all duration-300 overflow-hidden shadow-lg shadow-black/10">
              <Search className="absolute left-4 h-4 w-4 text-white/40 group-focus-within:text-orange-300 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for cakes, burgers, pizza..."
                className="w-full bg-transparent text-white placeholder:text-white/30 pl-11 pr-4 py-3.5 md:py-4 text-sm md:text-base outline-none"
              />
              <button
                type="submit"
                className="mr-1.5 px-5 md:px-6 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs md:text-sm font-semibold hover:from-orange-700 hover:to-amber-600 transition-all duration-300 whitespace-nowrap shadow-lg shadow-orange-500/30"
              >
                Search
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              size="xl"
              variant="premium"
              className="w-full sm:w-auto shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50"
              asChild
            >
              <Link to="/products">
                <span>Order Now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-white/5 backdrop-blur-sm"
              asChild
            >
              <Link to="/category/cake">
                <span>Explore Menu</span>
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/35 text-[11px] md:text-xs tracking-wide uppercase"
          >
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.8 Rating</span>
            <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-amber-400" /> 50+ Items</span>
            <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-amber-400" /> Free Delivery</span>
            <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-400" /> 30 min</span>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ===== CATEGORIES ===== */}
      {categories?.length > 0 && (
        <AnimatedSection className="mb-16 md:mb-24" delay={50}>
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold mb-2 block">What We Serve</span>
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900">Browse by Category</h2>
            <p className="text-sm text-stone-400 mt-2 max-w-lg mx-auto">
              From sweet treats to savoury delights — explore our handcrafted menu
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map((cat, idx) => {
              const Icon = categoryIcons[cat.name] || defaultIcon;
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <Link
                    to={`/category/${cat.name?.toLowerCase()}`}
                    className="group block bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-32 sm:h-40 overflow-hidden bg-stone-50">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="h-12 w-12 text-stone-200 transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-bold text-sm md:text-base text-white">
                          {displayNames[cat.name] || cat.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>
      )}

      {/* ===== POPULAR CATEGORY SECTIONS ===== */}
      {categories?.length > 0 && categories.slice(0, 3).map((cat, idx) => {
        const catData = categoryQueries[idx]?.data;
        const catProducts = catData?.products;
        const catLoading = categoryQueries[idx]?.isLoading;
        if (!catLoading && (!catProducts || catProducts.length === 0)) return null;
        return (
          <AnimatedSection key={cat._id} className="mb-16 md:mb-24" delay={idx * 50}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-center text-orange-500">
                  {(() => {
                    const Icon = categoryIcons[cat.name];
                    return Icon ? <Icon className="h-5 w-5" /> : null;
                  })()}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900">Popular {displayNames[cat.name] || cat.name}</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-stone-500 hover:text-orange-600 gap-1" asChild>
                <Link to={`/category/${cat.name?.toLowerCase()}`}>
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ProductGrid products={catProducts} isLoading={catLoading} />
          </AnimatedSection>
        );
      })}

      {/* ===== TOP PICKS ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold mb-2 block">Top Picks</span>
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900">Most Loved Items</h2>
          <p className="text-sm text-stone-400 mt-2 max-w-lg mx-auto">
            Our customers can&apos;t get enough of these
          </p>
        </div>
        <ProductGrid products={productData?.products} isLoading={allLoading} />
        <div className="text-center mt-6">
          <Button variant="outline" className="border-stone-200 text-stone-600 hover:text-orange-600 hover:border-orange-300" asChild>
            <Link to="/products">View Full Menu <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </AnimatedSection>

      {/* ===== STATS BANNER ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 px-6 py-12 md:p-16">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: 50, label: "Food Items", suffix: "+", decimals: 0, icon: Award },
              { value: 48, label: "Customer Rating", suffix: "", star: true, decimals: 1, icon: Star },
              { value: 30, label: "Avg. Delivery", suffix: " min", decimals: 0, icon: Timer },
              { value: 100, label: "Fresh Quality", suffix: "%", decimals: 0, icon: Zap },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                    <StatIcon className="h-5 w-5 text-orange-400" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-1">
                    <CountUp end={stat.value} duration={2000} suffix={stat.suffix} star={stat.star} decimals={stat.decimals} />
                  </p>
                  <p className="text-xs md:text-sm text-white/40 mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== WHY CHOOSE US ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold mb-2 block">Why Choose Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900">Built on Trust & Quality</h2>
          <p className="text-sm text-stone-400 mt-2 max-w-lg mx-auto">
            Here&apos;s why thousands of customers choose us every day
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {perks.map((perk, idx) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl border border-stone-200/70 p-6 md:p-8 text-center card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                <perk.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{perk.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ===== HOW IT WORKS ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold mb-2 block">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900">Fresh Food in 3 Easy Steps</h2>
          <p className="text-sm text-stone-400 mt-2 max-w-lg mx-auto">
            From your screen to your doorstep — fast, fresh & hassle-free
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.4 }}
              className="relative bg-white rounded-2xl border border-stone-200/70 p-6 md:p-8 text-center card-hover overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg font-bold flex items-center justify-center shadow-lg shadow-orange-500/30">
                {item.step}
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ===== ORDER VIA CALL / WHATSAPP ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="relative overflow-hidden rounded-3xl gradient-subtle border border-orange-200/60 px-6 py-10 md:p-14">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-bold text-stone-900 mb-2">
                Order via Call or WhatsApp
              </h2>
              <p className="text-sm md:text-base text-stone-500 max-w-md leading-relaxed">
                Prefer to talk? Call us or send a message on WhatsApp to place your order directly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href={`tel:${import.meta.env.VITE_BAKERY_PHONE || "+919009521831"}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-sm hover:from-orange-700 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5"
              >
                <Phone className="h-5 w-5" />
                <span>Call to Order</span>
              </a>
              <a
                href={`https://wa.me/${(import.meta.env.VITE_BAKERY_PHONE || "+919009521831").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1da851] transition-all duration-300 shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== FOOD GALLERY ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold mb-2 block">Our Gallery</span>
            <h2 className="text-xl md:text-2xl font-bold text-stone-900">A Feast for the Eyes</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-stone-500 hover:text-orange-600 gap-1.5" asChild>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Follow Us
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          {[
            "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80",
          ].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="relative overflow-hidden rounded-xl aspect-square group cursor-pointer"
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Heart className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ===== TESTIMONIALS ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold mb-2 block">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900">What Our Customers Say</h2>
          <p className="text-sm text-stone-400 mt-2 max-w-lg mx-auto">Real reviews from real people</p>
        </div>
        <div
          className="relative max-w-3xl mx-auto px-2 md:px-4"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative rounded-2xl md:rounded-3xl bg-white border border-stone-200/70 p-8 md:p-14 min-h-[240px] md:min-h-[260px] flex items-center justify-center shadow-soft">
            <Quote className="absolute top-4 md:top-6 left-4 md:left-6 h-10 w-10 text-orange-100" />
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-4 md:mb-5 ring-4 ring-orange-100 shadow-lg">
                    <img src={testimonials[testimonialIdx].img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-center gap-1 mb-3 md:mb-4">
                    {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                      <Star key={i} className="h-4 md:h-5 w-4 md:w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm md:text-lg text-stone-600 italic leading-relaxed mb-4 md:mb-5 max-w-xl mx-auto px-2">
                    &ldquo;{testimonials[testimonialIdx].text}&rdquo;
                  </p>
                  <p className="font-bold text-sm md:text-base text-stone-900">{testimonials[testimonialIdx].name}</p>
                  <p className="text-xs md:text-sm text-stone-400">{testimonials[testimonialIdx].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-4 md:mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === testimonialIdx ? "w-8 bg-orange-500" : "w-2 bg-stone-300 hover:bg-stone-400"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== APP DOWNLOAD CTA ===== */}
      <AnimatedSection className="mb-6 md:mb-12" delay={50}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-black p-8 md:p-16 text-center text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-float" style={{ animationDuration: "8s" }} />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl animate-float" style={{ animationDuration: "10s", animationDelay: "2s" }} />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            <div className="text-left">
              <Badge variant="premium" className="mb-4 md:mb-5 text-[10px] px-3 py-1 uppercase tracking-wide">
                <Sparkles className="h-3 w-3 mr-1" /> Coming Soon
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight text-white">
                Get the <span className="bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">ApnaMart</span> App
              </h2>
              <p className="text-white/50 text-sm md:text-lg mb-6 md:mb-8 max-w-md leading-relaxed">
                Order faster, track in real-time, and get exclusive app-only discounts. Download now and enjoy ₹100 off your first order!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/50 uppercase">Download on the</p>
                    <p className="text-sm font-semibold text-white">App Store</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/50 uppercase">Get it on</p>
                    <p className="text-sm font-semibold text-white">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="w-56 h-[28rem] rounded-3xl bg-gradient-to-b from-stone-800 to-stone-900 border-4 border-stone-700 shadow-2xl flex flex-col items-center justify-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 shadow-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-white font-bold text-lg text-center">ApnaMart</p>
                  <p className="text-white/40 text-xs text-center mb-6">Order your favourites</p>
                  <div className="w-full space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-xl bg-white/5 flex items-center gap-2 px-3">
                        <div className="w-6 h-6 rounded-lg bg-white/10" />
                        <div className="h-2.5 w-16 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-xs text-white font-bold text-center shadow-lg">
                    ORDER NOW
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50 flex items-center justify-center animate-bounce-in">
                  <span className="text-white text-xs font-bold">₹100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== BACK TO TOP ===== */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/30 transition-all duration-500 hover:shadow-orange-500/50 hover:scale-110 ${
          showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Home;
