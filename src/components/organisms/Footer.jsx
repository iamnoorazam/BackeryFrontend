import { Link } from "react-router-dom";
import { Mail, ChevronRight, Heart } from "lucide-react";
import Logo from "@/components/atoms/Logo";

const Footer = () => (
  <footer className="bg-stone-950 text-stone-300 mt-auto">
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Brand */}
        <div className="space-y-5">
          <Logo />
          <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
            Your neighbourhood food stop — fresh cakes, burgers, pizzas, biryani, and more, delivered hot & fresh to your door.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 text-stone-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://wa.me/918009521831"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 text-stone-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300"
              aria-label="WhatsApp"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-orange-400 font-semibold">Quick Links</h4>
          <ul className="space-y-3">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Our Menu" },
              { to: "/feedback", label: "Reviews" },
              { to: "/cart", label: "Cart" },
              { to: "/orders", label: "My Orders" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-stone-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3 w-3 text-stone-600 group-hover:text-orange-400 transition-colors" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-orange-400 font-semibold">Support</h4>
          <ul className="space-y-3">
            {[
              { to: "/", label: "Help Center" },
              { to: "/", label: "Privacy Policy" },
              { to: "/", label: "Terms of Service" },
              { to: "/", label: "Refund Policy" },
              { to: "/", label: "Contact Us" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-stone-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3 w-3 text-stone-600 group-hover:text-orange-400 transition-colors" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-orange-400 font-semibold">Stay Updated</h4>
          <p className="text-sm text-stone-400 leading-relaxed">
            Subscribe for exclusive offers, seasonal treats & fresh updates.
          </p>
          <div className="flex items-center bg-stone-800 border border-stone-700 rounded-2xl overflow-hidden focus-within:border-orange-500/50 transition-all duration-300 group">
            <Mail className="h-4 w-4 text-stone-500 ml-4 shrink-0 group-focus-within:text-orange-400 transition-colors" />
            <input
              type="email"
              placeholder="Your email"
              className="bg-transparent px-3 py-3 text-sm text-white placeholder:text-stone-500 outline-none w-full min-w-0"
            />
            <button className="h-full px-5 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold shrink-0 hover:from-orange-700 hover:to-amber-600 transition-all duration-300 py-3">
              Subscribe
            </button>
          </div>
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-3">We Accept</p>
            <div className="flex flex-wrap gap-2">
              {["Visa", "MC", "UPI", "PayPal", "Net"].map((pm) => (
                <div
                  key={pm}
                  className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-400"
                >
                  {pm}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="h-px bg-stone-800" />

    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-stone-500">
        &copy; {new Date().getFullYear()} ApnaMart. All rights reserved.
      </p>
      <p className="text-xs text-stone-500 flex items-center gap-1">
        Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for food lovers
      </p>
    </div>
  </footer>
);

export default Footer;
