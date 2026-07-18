import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, CakeSlice, Cookie, Croissant, Beef, ChefHat,
  ChevronRight, Star, Clock, Shield, Truck, Heart, Quote, ShoppingBag,
  MapPin, ArrowUp, Phone, MessageCircle, Sparkles,
  Award, Timer, Zap, BadgeCheck, Leaf, Coffee
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductGrid from "@/components/organisms/ProductGrid";
import ProductCard from "@/components/molecules/ProductCard";
import VendorGrid from "@/components/organisms/VendorGrid";
import Hero3D from "@/components/organisms/Hero3D";
import FadeInSection from "@/components/atoms/FadeInSection";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useVendors } from "@/hooks/useVendors";
import { productApi } from "@/api/product.api";

const displayNames = {
  Cake: "Cakes", Pastry: "Pastries", Cookie: "Cookies", "Fast Food": "Fast Food",
  Bread: "Bread", Dessert: "Desserts", Beverage: "Beverages",
};

const categoryIcons = {
  Cake: CakeSlice, Pastry: Croissant, Cookie, "Fast Food": Beef, Bread: ChefHat, Dessert: CakeSlice, Beverage: Coffee,
};
const defaultIcon = CakeSlice;

const testimonials = [
  { text: "The red velvet cake was divine and I picked up the prettiest kurti in the same order! Saffron & Silk is my go-to for treats and outfits.", name: "Priya Sharma", role: "Regular Customer", rating: 5, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80" },
  { text: "Ordered a custom birthday cake and it exceeded all expectations. Beautiful design and incredibly fresh. Highly recommended!", name: "Rahul Mehta", role: "Food Enthusiast", rating: 5, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" },
  { text: "Their chocolate croissants are to die for! Finally a bakery that delivers quality and taste consistently.", name: "Anita Kapoor", role: "Home Baker", rating: 5, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80" },
  { text: "Ordered a full dessert platter for our anniversary party and everyone raved. The macarons were perfection!", name: "Vikram Joshi", role: "Event Planner", rating: 5, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80" },
];

const perks = [
  { icon: Heart, title: "Baked with Love", desc: "Every item is handcrafted with premium ingredients and a dash of love." },
  { icon: Leaf, title: "Premium Ingredients", desc: "Only the finest flour, butter, and Belgian chocolate go into our bakes." },
  { icon: Truck, title: "Free Delivery", desc: "Free delivery on orders above ₹299. Fresh from oven to your doorstep." },
  { icon: Clock, title: "Always Fresh", desc: "Baked fresh every morning. We never sell day-old products — guaranteed." },
];

const steps = [
  {
    step: "01", icon: ShoppingBag, title: "Browse & Choose",
    desc: "Explore our menu of freshly baked goods — from classic cakes to artisanal pastries and warm cookies.",
  },
  {
    step: "02", icon: ChefHat, title: "We Bake Fresh",
    desc: "Every order is made fresh with premium ingredients. Our bakers prepare your treats with love and care.",
  },
  {
    step: "03", icon: Truck, title: "Delivered with Love",
    desc: "Our delivery partners bring your order straight to your door. Warm, fresh, and on time — every time.",
  },
];

const featuredProducts = [
  { name: "Belgian Chocolate Cake", price: "₹899", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80", badge: "Bestseller" },
  { name: "Strawberry Macarons", price: "₹449", img: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&q=80", badge: "New" },
  { name: "Butter Croissant", price: "₹199", img: "https://images.unsplash.com/photo-1624372068884-e6887b195a4c?w=600&q=80", badge: "Fresh" },
  { name: "Red Velvet Cupcake", price: "₹149", img: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80", badge: "Bestseller" },
  { name: "Artisan Sourdough", price: "₹349", img: "https://images.unsplash.com/photo-1549931319-a5457534672f?w=600&q=80", badge: "Fresh" },
  { name: "Mixed Berry Tart", price: "₹599", img: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80", badge: "" },
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
      {star && <Star className="h-4 md:h-5 w-4 md:w-5 fill-[#D2691E] text-primary" />}
    </span>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: productData, isLoading: allLoading } = useProducts({ limit: 8 });
  const { data: vendorData, isLoading: vendorsLoading } = useVendors({ limit: 6 });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", flavor: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);

  const categoryQueries = useQueries({
    queries: (categories || []).slice(0, 3).map((cat) => ({
      queryKey: ["products", "category", cat._id],
      queryFn: () => productApi.getAll({ category: cat._id, limit: 8 }).then((r) => r.data.data),
    })),
  });

  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const carTimer = setInterval(() => {
      setCarouselIdx((i) => (i + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(carTimer);
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setFormSubmitted(true);
      setFormData({ name: "", email: "", phone: "", flavor: "", message: "" });
      setTimeout(() => setFormSubmitted(false), 5000);
    }
  };

  return (
    <div>
      {/* ===== HERO (3D) ===== */}
      <Hero3D />

      {/* ===== CATEGORIES ===== */}
      <AnimatedSection id="categories" className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">What We Offer</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">Browse Our Collections</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            From sweet treats and savoury bites to elegant women&apos;s fashion — explore it all
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {(categories || [1, 2, 3, 4, 5, 6]).map((cat, idx) => {
            const isPlaceholder = typeof cat === "number";
            const catName = isPlaceholder ? ["Cake", "Pastry", "Cookie", "Bread", "Dessert", "Beverage"][idx] : cat.name;
            const Icon = categoryIcons[catName] || defaultIcon;
            const catImage = isPlaceholder ? null : cat.image;
            const catId = isPlaceholder ? `ph-${idx}` : cat._id;
            return (
              <motion.div
                key={catId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Link
                  to={isPlaceholder ? "/products" : `/category/${cat.name?.toLowerCase()}`}
                  className="group block bg-card rounded-2xl border border-border/70 overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-32 sm:h-40 overflow-hidden bg-muted">
                    {catImage ? (
                      <img
                        src={catImage}
                        alt={catName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-14 w-14 text-muted-foreground/40 transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-bold text-sm md:text-base text-white font-display">
                        {displayNames[catName] || catName}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* ===== EXPLORE STORES ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">The Marketplace</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-display">Explore Stores Near You</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1" asChild>
            <Link to="/stores">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <VendorGrid
          vendors={vendorData?.vendors}
          isLoading={vendorsLoading}
          emptyTitle="No stores yet"
          emptyDescription="New stores are coming to the marketplace soon."
        />
      </AnimatedSection>

      {/* ===== LADIES BOUTIQUE FEATURE ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A1E3A] via-[#7B2C5E] to-[#9E2B5E] px-6 py-10 md:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-[#E58FB0]/25 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 bg-[#F3B24E]/20 rounded-full blur-3xl" />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#FFD9A0] font-semibold mb-2 block font-sans">New — The Ladies Boutique</span>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 font-display">
                Not just sweets — <span className="italic">style</span> too
              </h2>
              <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6 max-w-md">
                Explore our curated women&apos;s collection — kurtis, sarees, lehengas, gowns &amp; everyday
                tops in premium fabrics. Grace for every occasion.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-7">
                {["Kurtis", "Sarees", "Lehengas", "Gowns", "Tops"].map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/85 backdrop-blur">
                    {t}
                  </span>
                ))}
              </div>
              <Button size="lg" className="bg-white text-[#9E2B5E] hover:bg-[#FFF0F5] border-0 shadow-xl" asChild>
                <Link to="/ladies">Explore the Boutique <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80",
                "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80",
                "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80",
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
              ].map((img, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-xl ${i % 2 ? "mt-6" : ""}`}>
                  <img src={img} alt="" className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

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
                <div className="w-10 h-10 rounded-2xl bg-muted border border-[#D2691E]/30 flex items-center justify-center text-primary">
                  {(() => {
                    const Icon = categoryIcons[cat.name];
                    return Icon ? <Icon className="h-5 w-5" /> : null;
                  })()}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">Popular {displayNames[cat.name] || cat.name}</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1" asChild>
                <Link to={`/category/${cat.name?.toLowerCase()}`}>
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ProductGrid products={catProducts} isLoading={catLoading} />
          </AnimatedSection>
        );
      })}

      {/* ===== FEATURED PRODUCTS CAROUSEL ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">Featured Treats</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">Our Signature Bakes</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Handpicked favourites that our customers love
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-border/70 p-6 md:p-10">
          <div className="flex overflow-x-auto scrollbar-hide gap-6 snap-x snap-mandatory -mx-2 px-2 pb-2">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="snap-start shrink-0 w-[260px] md:w-[280px] group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted border border-border/50 card-hover">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D2691E] text-white shadow-lg">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-foreground text-base mb-1">{product.name}</h3>
                    <p className="text-primary font-semibold text-sm">{product.price}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-card/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-elevated">
                      <Button size="sm" className="bg-[#D2691E] hover:bg-[#A0522D] text-white border-0 text-xs">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {featuredProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === carouselIdx ? "w-8 bg-[#D2691E]" : "w-2 bg-border hover:bg-[#D2691E]/50"
                }`}
                aria-label={`Feature ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== TOP PICKS ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">Top Picks</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">Most Loved Bakes</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Our customers can&apos;t get enough of these
          </p>
        </div>
        <ProductGrid products={productData?.products} isLoading={allLoading} />
        <div className="text-center mt-6">
          <Button variant="outline" className="border-[#D2691E]/30 text-primary hover:text-[#A0522D] hover:border-[#D2691E]/60" asChild>
            <Link to="/products">View Full Menu <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </AnimatedSection>

      {/* ===== STATS BANNER ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E2723] via-[#4E342E] to-[#3E2723] px-6 py-12 md:p-16">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#D2691E]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#E8A04F]/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: 50, label: "Bake Varieties", suffix: "+", decimals: 0, icon: Award },
              { value: 48, label: "Customer Rating", suffix: "", star: true, decimals: 1, icon: Star },
              { value: 30, label: "Min Bake Time", suffix: " min", decimals: 0, icon: Timer },
              { value: 100, label: "Fresh Guarantee", suffix: "%", decimals: 0, icon: Zap },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                    <StatIcon className="h-5 w-5 text-primary" />
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
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">Why Saffron &amp; Silk</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">Built on Trust & Quality</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Here&apos;s why thousands choose us every day
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {perks.map((perk, idx) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-card rounded-2xl border border-border/70 p-6 md:p-8 text-center card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2691E]/20">
                <perk.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{perk.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ===== HOW IT WORKS ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">Fresh Bakes in 3 Easy Steps</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            From your screen to your doorstep — fresh, fast & hassle-free
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.4 }}
              className="relative bg-card rounded-2xl border border-border/70 p-6 md:p-8 text-center card-hover overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A04F] text-white text-lg font-bold flex items-center justify-center shadow-lg shadow-[#D2691E]/30">
                {item.step}
              </div>
              <div className="w-16 h-16 rounded-2xl bg-muted text-primary flex items-center justify-center mx-auto mb-4 border border-[#D2691E]/20">
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ===== CUSTOM CAKE ORDER FORM ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-2 to-surface-3 border border-[#D2691E]/30 px-6 py-10 md:p-14">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#D2691E]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#E8A04F]/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">Custom Orders</span>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 font-display">Order a Custom Cake</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                Dreaming of a specific design? Tell us your vision and we&apos;ll bake the perfect cake for your special occasion — birthdays, weddings, anniversaries, or just because.
              </p>
              <div className="hidden md:flex items-center gap-4 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-card shadow-soft flex items-center justify-center">
                    <CakeSlice className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Custom Design</p>
                    <p className="text-xs text-muted-foreground">Any theme, any size</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-card shadow-soft flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Premium Ingredients</p>
                    <p className="text-xs text-muted-foreground">100% fresh & natural</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-soft border border-border/60">
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-success-subtle text-success flex items-center justify-center mx-auto mb-4">
                    <BadgeCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Thank You!</h3>
                  <p className="text-sm text-muted-foreground">We&apos;ll reach out within 24 hours to discuss your custom cake.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="Your phone number"
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Flavour Preference</label>
                      <select
                        name="flavor"
                        value={formData.flavor}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select flavour</option>
                        <option value="chocolate">Belgian Chocolate</option>
                        <option value="vanilla">Classic Vanilla</option>
                        <option value="red-velvet">Red Velvet</option>
                        <option value="fruit">Fresh Fruit</option>
                        <option value="custom">Custom Flavour</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Your Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="Describe your dream cake — design, size, occasion, dietary needs..."
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#D2691E] hover:bg-[#A0522D] text-white border-0 py-3"
                  >
                    Send Enquiry <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== ORDER VIA CALL / WHATSAPP ===== */}
      <AnimatedSection className="mb-16 md:mb-24" delay={50}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E2723] to-[#4E342E] border border-[#5D4037]/60 px-6 py-10 md:p-14">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#D2691E]/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#E8A04F]/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 font-display">
                Order via Call or WhatsApp
              </h2>
              <p className="text-sm md:text-base text-white/60 max-w-md leading-relaxed">
                Prefer to talk? Call us or send a message on WhatsApp to place your order directly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href={`tel:${import.meta.env.VITE_BAKERY_PHONE || "+919009521831"}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#D2691E] text-white font-semibold text-sm hover:bg-[#A0522D] transition-all duration-300 shadow-lg shadow-[#D2691E]/20 hover:shadow-[#D2691E]/40 hover:-translate-y-0.5"
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
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">Our Gallery</span>
            <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">A Feast for the Eyes</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1.5" asChild>
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
            "https://images.unsplash.com/photo-1607478900766-56c9c9776e1a?w=600&q=80",
            "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
            "https://images.unsplash.com/photo-1612206980018-98d99b7f145f?w=600&q=80",
            "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&q=80",
            "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80",
            "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80",
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2 block font-sans">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">What Our Customers Say</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Real reviews from real people</p>
        </div>
        <div
          className="relative max-w-3xl mx-auto px-2 md:px-4"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative rounded-2xl md:rounded-3xl bg-surface border border-border/70 p-8 md:p-14 min-h-[240px] md:min-h-[260px] flex items-center justify-center shadow-soft">
            <Quote className="absolute top-4 md:top-6 left-4 md:left-6 h-10 w-10 text-primary/20" />
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
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-4 md:mb-5 ring-4 ring-[#D2691E]/20 shadow-lg">
                    <img src={testimonials[testimonialIdx].img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-center gap-1 mb-3 md:mb-4">
                    {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                      <Star key={i} className="h-4 md:h-5 w-4 md:w-5 fill-[#D2691E] text-primary" />
                    ))}
                  </div>
                  <p className="text-sm md:text-lg text-foreground/80 italic leading-relaxed mb-4 md:mb-5 max-w-xl mx-auto px-2">
                    &ldquo;{testimonials[testimonialIdx].text}&rdquo;
                  </p>
                  <p className="font-bold text-sm md:text-base text-foreground">{testimonials[testimonialIdx].name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{testimonials[testimonialIdx].role}</p>
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
                  i === testimonialIdx ? "w-8 bg-[#D2691E]" : "w-2 bg-border hover:bg-[#D2691E]/50"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== APP DOWNLOAD CTA ===== */}
      <AnimatedSection className="mb-6 md:mb-12" delay={50}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E2723] via-[#4E342E] to-[#3E2723] p-8 md:p-16 text-center text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D2691E]/10 rounded-full blur-3xl animate-float" style={{ animationDuration: "8s" }} />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#E8A04F]/10 rounded-full blur-3xl animate-float" style={{ animationDuration: "10s", animationDelay: "2s" }} />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            <div className="text-left">
              <Badge className="mb-4 md:mb-5 text-[10px] px-3 py-1 uppercase tracking-wide bg-[#D2691E] text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" /> Coming Soon
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight text-white font-display">
                Get the <span className="bg-gradient-to-r from-[#E8A04F] to-[#9E2B5E] bg-clip-text text-transparent">Saffron &amp; Silk</span> App
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
                <div className="w-56 h-[28rem] rounded-3xl bg-gradient-to-b from-[#5D4037] to-[#3E2723] border-4 border-[#5D4037] shadow-2xl flex flex-col items-center justify-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] flex items-center justify-center mb-4 shadow-lg">
                    <CakeSlice className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-white font-bold text-lg text-center font-display">Saffron &amp; Silk</p>
                  <p className="text-white/40 text-xs text-center mb-6">Baked &amp; styled with love</p>
                  <div className="w-full space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-xl bg-white/5 flex items-center gap-2 px-3">
                        <div className="w-6 h-6 rounded-lg bg-white/10" />
                        <div className="h-2.5 w-16 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-xs text-white font-bold text-center shadow-lg">
                    ORDER NOW
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#D2691E] shadow-lg shadow-[#D2691E]/50 flex items-center justify-center animate-bounce-in">
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
        className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white shadow-lg shadow-[#D2691E]/30 transition-all duration-500 hover:shadow-[#D2691E]/50 hover:scale-110 ${
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
