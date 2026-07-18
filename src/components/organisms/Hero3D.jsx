import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Star, Truck, Clock, BadgeCheck, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Hero3D — an interactive, dependency-free 3D hero.
 * The stage tilts toward the pointer (desktop); layered cards sit at
 * different translateZ depths so the tilt produces real parallax.
 * On touch devices the tilt stays neutral while the float loops keep it alive.
 */
const Hero3D = () => {
  const stageRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 16,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 16,
  });
  const glowX = useTransform(mx, [-0.5, 0.5], ["30%", "70%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["30%", "70%"]);

  const handleMove = (e) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl mb-12 md:mb-16 bg-gradient-to-br from-[#2A1712] via-[#3E2723] to-[#4A1E3A]">
      {/* ambient glow that follows the pointer */}
      <motion.div
        style={{ left: glowX, top: glowY }}
        className="pointer-events-none absolute h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D2691E]/25 blur-[120px]"
      />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-[#9E2B5E]/25 blur-[110px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:26px_26px]" />

      <div className="relative z-10 grid lg:grid-cols-2 items-center gap-8 lg:gap-4 px-5 sm:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
        {/* ===== Copy ===== */}
        <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Badge className="mb-5 text-[10px] md:text-xs px-3 py-1.5 tracking-wider uppercase shadow-lg shadow-[#D2691E]/30 bg-white/10 backdrop-blur text-[#FFE9C7] border border-white/15 hover:bg-white/15">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Bakehouse &amp; Boutique — Under One Roof
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display font-bold tracking-tight leading-[1.05] text-[2.4rem] sm:text-6xl lg:text-7xl text-balance"
          >
            <span className="text-white">Sweet as </span>
            <span className="bg-gradient-to-r from-[#F3B24E] to-[#E8A04F] bg-clip-text text-transparent">
              Saffron
            </span>
            <span className="text-white">,</span>
            <br />
            <span className="text-white">graceful as </span>
            <span className="bg-gradient-to-r from-[#E8A04F] via-[#D2691E] to-[#E58FB0] bg-clip-text text-transparent">
              Silk
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-5 text-sm sm:text-base md:text-lg text-white/65 leading-relaxed text-balance"
          >
            Freshly baked cakes, pastries and artisanal treats — plus an elegant women&apos;s
            boutique of kurtis, sarees, lehengas &amp; gowns. Order it all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-7 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
          >
            <Button
              size="xl"
              className="w-full sm:w-auto group bg-[#D2691E] hover:bg-[#A0522D] text-white border-0 shadow-2xl shadow-[#D2691E]/30"
              asChild
            >
              <Link to="/products">
                <ShoppingBag className="h-4 w-4" />
                <span>Order Treats</span>
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full sm:w-auto group border-white/25 text-white hover:bg-white/10 hover:border-white/45 bg-white/5 backdrop-blur-sm"
              asChild
            >
              <Link to="/ladies">
                <span>Shop the Boutique</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-white/45 text-[11px] md:text-xs tracking-wide uppercase"
          >
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-[#F3B24E] text-[#F3B24E]" /> 4.8 Rating
            </span>
            <span className="h-1 w-1 rounded-full bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-[#E58FB0]" /> 60+ Products
            </span>
            <span className="h-1 w-1 rounded-full bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#F3B24E]" /> Fast Delivery
            </span>
          </motion.div>
        </div>

        {/* ===== 3D stage ===== */}
        <div
          ref={stageRef}
          onMouseMove={handleMove}
          onMouseLeave={reset}
          className="relative h-[360px] sm:h-[440px] lg:h-[520px] [perspective:1400px]"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* rotating dashed ring, deep back */}
            <div
              style={{ transform: "translateZ(-60px)" }}
              className="absolute h-72 w-72 sm:h-80 sm:w-80 rounded-full border border-dashed border-white/15 animate-spin-slow"
            />

            {/* hero cake — main layer */}
            <motion.div
              style={{ transform: "translateZ(70px)" }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="h-52 w-52 sm:h-64 sm:w-64 lg:h-72 lg:w-72 rounded-[2rem] overflow-hidden ring-1 ring-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&q=85"
                  alt="Signature cake"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>

            {/* floating fashion card, front-left */}
            <motion.div
              style={{ transform: "translateZ(120px)" }}
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute left-1 sm:left-2 bottom-6 sm:bottom-10"
            >
              <div className="h-20 w-16 sm:h-36 sm:w-28 rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-white/25 shadow-2xl rotate-[-6deg]">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80"
                  alt="Boutique wear"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>

            {/* floating macaron/pastry, front-right */}
            <motion.div
              style={{ transform: "translateZ(150px)" }}
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute right-1 sm:right-2 top-6 sm:top-10"
            >
              <div className="h-16 w-16 sm:h-28 sm:w-28 rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-white/25 shadow-2xl rotate-[7deg]">
                <img
                  src="https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&q=80"
                  alt="Macarons"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>

            {/* glass rating chip, top-left */}
            <motion.div
              style={{ transform: "translateZ(180px)" }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="absolute left-1 sm:-left-2 top-3 sm:top-8 hidden sm:block"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-xl">
                <div className="flex -space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full ring-2 ring-white bg-gradient-to-br from-[#F3B24E] to-[#9E2B5E]"
                    />
                  ))}
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-bold text-[#3E2723] flex items-center gap-0.5">
                    4.8 <Star className="h-3 w-3 fill-[#F3B24E] text-[#F3B24E]" />
                  </p>
                  <p className="text-[9px] text-[#8D6E63]">2k+ happy customers</p>
                </div>
              </div>
            </motion.div>

            {/* glass delivery chip, bottom-right */}
            <motion.div
              style={{ transform: "translateZ(200px)" }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute right-1 sm:right-4 bottom-6 sm:bottom-14 hidden sm:block"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-xl">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#E8A04F] flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-bold text-[#3E2723]">Fresh &amp; Fast</p>
                  <p className="text-[9px] text-[#8D6E63]">Baked to order</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* soft fade into the page */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFF8F0] to-transparent" />
    </section>
  );
};

export default Hero3D;
