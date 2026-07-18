import { Outlet } from "react-router-dom";
import Navbar from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/Footer";
import BottomBar from "@/components/organisms/BottomBar";
import { CheckoutModalProvider } from "@/store/CheckoutModal";
import { Phone, MessageCircle } from "lucide-react";

const BAKERY_PHONE = import.meta.env.VITE_BAKERY_PHONE || "+918009521831";
const PHONE_DIGITS = BAKERY_PHONE.replace(/[^0-9]/g, "");

const MainLayout = () => (
  <CheckoutModalProvider>
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
      <Outlet />
    </main>
    <Footer />
    <BottomBar />

    {/* Floating Action Buttons */}
    <div className="fixed z-50 flex flex-col items-end gap-3 bottom-28 md:bottom-6 right-4 md:right-6">
      <a
        href={`tel:${BAKERY_PHONE}`}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#D2691E] to-[#E8A04F] text-white shadow-lg hover:shadow-[#D2691E]/30 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Call to order"
      >
        <Phone className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:inline">Call</span>
      </a>
      <a
        href={`https://wa.me/${PHONE_DIGITS}?text=Hi%20Saffron%20%26%20Silk!%20I%20would%20like%20to%20place%20an%20order.`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#25D366] text-white shadow-lg hover:shadow-[#25D366]/30 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  </div>
  </CheckoutModalProvider>
);

export default MainLayout;
