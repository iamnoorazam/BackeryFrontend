import { Link } from "react-router-dom";
import { Mail, ChevronRight, Heart, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import Logo from "@/components/atoms/Logo";

const PHONE = import.meta.env.VITE_BAKERY_PHONE || "+919009521831";
const PHONE_DIGITS = PHONE.replace(/[^0-9]/g, "");

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    hover: "hover:bg-gradient-to-br hover:from-[#D2691E] hover:to-[#9E2B5E]",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    hover: "hover:bg-[#1877F2]",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${PHONE_DIGITS}`,
    hover: "hover:bg-[#25D366]",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  },
];

const linkCols = [
  {
    title: "Explore",
    links: [
      { to: "/", label: "Home" },
      { to: "/products", label: "Shop All" },
      { to: "/ladies", label: "Ladies Boutique" },
      { to: "/feedback", label: "Reviews" },
      { to: "/orders", label: "My Orders" },
    ],
  },
];

const Footer = () => (
  <footer className="relative mt-auto bg-gradient-to-br from-[#2A1712] via-[#3E2723] to-[#4A1E3A] text-[#E8D5C4]">
    {/* warm saffron→silk top accent */}
    <div className="h-[3px] w-full bg-gradient-to-r from-[#F3B24E] via-[#D2691E] to-[#9E2B5E]" />
    <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:24px_24px]" />

    <div className="relative w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Brand */}
        <div className="space-y-5">
          <Logo dark />
          <p className="text-sm text-[#B39B8E] leading-relaxed max-w-xs font-sans">
            Baked &amp; styled with love. Handcrafted cakes, pastries and treats, alongside an
            elegant women&apos;s boutique — all in one place.
          </p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#B39B8E] hover:text-white hover:border-transparent transition-all duration-300 ${s.hover}`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>

        {/* Explore links */}
        {linkCols.map((col) => (
          <div key={col.title} className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#F3B24E] font-semibold">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-[#B39B8E] hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="h-3 w-3 text-[#7A5C4E] group-hover:text-[#D2691E] group-hover:translate-x-0.5 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-[#F3B24E] font-semibold">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-[#B39B8E]">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#E58FB0]" />
              <span>123 Bakery Lane, Sweet Town, Mumbai - 400001</span>
            </li>
            <li>
              <a href={`tel:${PHONE}`} className="flex items-center gap-3 text-sm text-[#B39B8E] hover:text-white transition-colors">
                <Phone className="h-4 w-4 shrink-0 text-[#E58FB0]" />
                <span>{PHONE.replace(/(\+\d{2})(\d{5})(\d{5})/, "$1 $2 $3")}</span>
              </a>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#B39B8E]">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-[#E58FB0]" />
              <span>Mon – Sun: 7:00 AM – 10:00 PM</span>
            </li>
          </ul>
          <a
            href={`https://wa.me/${PHONE_DIGITS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1da851] transition-all duration-300 shadow-lg shadow-[#25D366]/20"
          >
            <Phone className="h-4 w-4" />
            WhatsApp Order
          </a>
        </div>

        {/* Newsletter */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <h4 className="text-xs uppercase tracking-widest text-[#F3B24E] font-semibold">Stay Updated</h4>
          <p className="text-sm text-[#B39B8E] leading-relaxed">
            Subscribe for exclusive offers, seasonal treats &amp; new boutique arrivals.
          </p>
          <form className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#D2691E]/60 transition-all duration-300 group" onSubmit={(e) => e.preventDefault()}>
            <Mail className="h-4 w-4 text-[#7A5C4E] ml-4 shrink-0 group-focus-within:text-[#D2691E] transition-colors" />
            <input
              type="email"
              placeholder="Your email"
              className="bg-transparent px-3 py-3 text-sm text-white placeholder:text-[#7A5C4E] outline-none w-full min-w-0"
            />
            <button className="h-full px-4 bg-gradient-to-r from-[#D2691E] to-[#9E2B5E] text-white shrink-0 hover:opacity-90 transition-opacity py-3 flex items-center justify-center" aria-label="Subscribe">
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="pt-1">
            <p className="text-[10px] uppercase tracking-widest text-[#7A5C4E] font-semibold mb-3">We Accept</p>
            <div className="flex flex-wrap gap-2">
              {["Visa", "MC", "UPI", "PayPal", "Net"].map((pm) => (
                <div
                  key={pm}
                  className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#B39B8E]"
                >
                  {pm}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="relative h-px bg-white/10" />

    <div className="relative w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-[#7A5C4E]">
        &copy; {new Date().getFullYear()} Saffron &amp; Silk. All rights reserved.
      </p>
      <p className="text-xs text-[#7A5C4E] flex items-center gap-1">
        Made with <Heart className="h-3 w-3 text-[#E58FB0] fill-[#E58FB0]" /> for lovers of sweet &amp; style
      </p>
    </div>
  </footer>
);

export default Footer;
