import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, ChevronRight, Star, Truck, ShieldCheck,
  Ruler, Heart, Gem,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/organisms/ProductGrid";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { FASHION_CATEGORIES, categoryMeta, getDisplayName, isFashionCategory } from "@/lib/categories";

const perks = [
  { icon: Ruler, title: "True-to-Size Fits", desc: "Detailed size guides from S to XL & free-size, so every piece drapes just right." },
  { icon: Gem, title: "Premium Fabrics", desc: "Cotton, rayon, silk, georgette & chikankari — handpicked for comfort and grace." },
  { icon: Truck, title: "Careful Delivery", desc: "Neatly packed and delivered to your door in 2–4 days, ready to wear." },
  { icon: ShieldCheck, title: "Easy Returns", desc: "Not the right fit? Enjoy hassle-free exchanges within 7 days." },
];

const Ladies = () => {
  const { data: categories } = useCategories();
  const { data: productData, isLoading } = useProducts({ limit: 60 });

  // Boutique categories, ordered to match FASHION_CATEGORIES where possible.
  const fashionCats = useMemo(() => {
    const cats = (categories || []).filter((c) => isFashionCategory(c.name));
    return [...cats].sort(
      (a, b) => FASHION_CATEGORIES.indexOf(a.name) - FASHION_CATEGORIES.indexOf(b.name)
    );
  }, [categories]);

  const fashionProducts = useMemo(
    () => (productData?.products || []).filter((p) => isFashionCategory(p.category?.name)),
    [productData]
  );

  const featured = fashionProducts.slice(0, 8);

  return (
    <div className="space-y-14 md:space-y-20 pb-10">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A1E3A] via-[#7B2C5E] to-[#9E2B5E]">
        <div className="pointer-events-none absolute -top-24 -right-16 h-96 w-96 rounded-full bg-[#E58FB0]/25 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-[#B8860B]/25 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:26px_26px]" />

        <div className="relative z-10 grid lg:grid-cols-2 items-center gap-8 px-6 sm:px-10 lg:px-14 py-14 md:py-20">
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <Badge className="mb-5 text-[10px] md:text-xs px-3 py-1.5 tracking-wider uppercase bg-white/10 backdrop-blur text-[#FFE1EC] border border-white/15 hover:bg-white/15">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> The Ladies Boutique
            </Badge>
            <h1 className="font-display font-bold tracking-tight leading-[1.05] text-[2.4rem] sm:text-5xl lg:text-6xl text-white text-balance">
              Draped in <span className="bg-gradient-to-r from-[#F3B24E] to-[#FFD9A0] bg-clip-text text-transparent">Elegance</span>,
              styled for <span className="italic">you</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base md:text-lg text-white/70 leading-relaxed text-balance">
              Handpicked kurtis, sarees, lehengas, gowns and everyday tops — crafted from premium
              fabrics for festive days, celebrations and effortless everyday grace.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Button size="xl" className="w-full sm:w-auto bg-white text-[#9E2B5E] hover:bg-[#FFF0F5] border-0 shadow-2xl" asChild>
                <a href="#collections"><span>Explore Collections</span><ArrowRight className="h-4 w-4" /></a>
              </Button>
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm" asChild>
                <Link to="/products"><span>Shop Everything</span></Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-white/50 text-[11px] md:text-xs tracking-wide uppercase">
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-[#F3B24E] text-[#F3B24E]" /> Curated Styles</span>
              <span className="h-1 w-1 rounded-full bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-[#FFD9A0]" /> S – XL &amp; Free Size</span>
              <span className="h-1 w-1 rounded-full bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-[#E58FB0]" /> 2–4 Day Delivery</span>
            </div>
          </div>

          {/* image collage */}
          <div className="relative hidden lg:block h-[420px]">
            {[
              { src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80", cls: "left-6 top-2 h-64 w-48 rotate-[-5deg]" },
              { src: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80", cls: "right-8 top-10 h-72 w-52 rotate-[6deg]" },
              { src: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80", cls: "left-24 bottom-0 h-56 w-44 rotate-[3deg]" },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                className={`absolute rounded-3xl overflow-hidden ring-1 ring-white/25 shadow-2xl ${img.cls}`}
              >
                <img src={img.src} alt="" className="h-full w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FFF8F0] to-transparent" />
      </section>

      {/* ===== COLLECTIONS ===== */}
      <section id="collections">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-[#9E2B5E] font-semibold mb-2 block font-sans">Shop by Category</span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3E2723]">Our Collections</h2>
          <p className="text-sm text-[#8D6E63] mt-2 max-w-lg mx-auto">
            From daily-wear grace to festive grandeur — find your next favourite outfit
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {(fashionCats.length ? fashionCats : FASHION_CATEGORIES.map((name) => ({ _id: name, name }))).map((cat, idx) => {
            const meta = categoryMeta[cat.name] || {};
            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: (idx % 3) * 0.08, duration: 0.5 }}
              >
                <Link
                  to={`/category/${cat.name?.toLowerCase()}`}
                  className="group relative block h-64 md:h-72 rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={getDisplayName(cat.name)}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient || "from-[#7B2C5E] to-[#9E2B5E]"}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A0E20]/90 via-[#2A0E20]/25 to-transparent" />
                  <span className="absolute top-4 left-4 text-3xl drop-shadow-lg">{meta.icon || "👗"}</span>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display font-bold text-xl md:text-2xl text-white">{getDisplayName(cat.name)}</h3>
                    <p className="text-xs md:text-sm text-white/75 mt-1 line-clamp-2 max-w-xs">{meta.desc || cat.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FFD9A0] group-hover:gap-2 transition-all">
                      {meta.cta || "Shop Now"} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      {(isLoading || featured.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] border border-[#9E2B5E]/25 flex items-center justify-center text-[#9E2B5E]">
                <Heart className="h-5 w-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#3E2723] font-display">Trending in the Boutique</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-[#8D6E63] hover:text-[#9E2B5E] gap-1" asChild>
              <Link to="/products">View all <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <ProductGrid products={featured} isLoading={isLoading} />
        </section>
      )}

      {/* ===== PERKS ===== */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {perks.map((perk, idx) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8D5C4]/70 p-6 text-center card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9E2B5E] to-[#E58FB0] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9E2B5E]/20">
                <perk.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#3E2723] mb-1.5">{perk.title}</h3>
              <p className="text-sm text-[#8D6E63] leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E2723] via-[#4A1E3A] to-[#9E2B5E] px-6 py-12 md:p-16 text-center">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#E58FB0]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#F3B24E]/15 blur-3xl" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white font-display mb-3">Sweet treats meet timeless style</h2>
            <p className="text-white/60 text-sm md:text-base mb-7">
              Order a celebration cake and the perfect outfit to match — all from one place, delivered with love.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="xl" className="w-full sm:w-auto bg-white text-[#9E2B5E] hover:bg-[#FFF0F5] border-0" asChild>
                <Link to="/products"><span>Start Shopping</span><ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 bg-white/5" asChild>
                <Link to="/"><span>Back to Home</span></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ladies;
