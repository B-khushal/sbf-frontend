import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  Gift, 
  ChevronDown, 
  Truck, 
  Heart, 
  ShieldCheck, 
  Cake, 
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Do you offer same-day flower and cake delivery in Hyderabad and Secunderabad?",
    answer: "Yes! SB Florist provides guaranteed same-day flower, cake, and gift delivery across both Hyderabad and Secunderabad. Place your order during our business hours, and our local delivery team will hand-deliver fresh blooms and cakes right to your recipient's doorstep within hours."
  },
  {
    question: "How do your delivery charges and time slots work?",
    answer: "We offer Free Delivery on your 1st order for all new customers! Additionally, standard delivery is FREE on orders of ₹999 and above (₹150 for orders below ₹999). You can select from Standard Delivery (9 AM - 9 PM), hourly Fixed Time Delivery (+₹150 slot fee), or our popular Midnight Surprise Delivery (+₹150-₹300 slot fee) during checkout."
  },
  {
    question: "Can I schedule a midnight flower delivery for birthdays or anniversaries?",
    answer: "Absolutely! Our Midnight Surprise Delivery slot is specifically designed for birthdays, anniversaries, and special moments. Our delivery partner will deliver between 11:00 PM and 11:59 PM to surprise your loved ones right as the clock strikes midnight."
  },
  {
    question: "Which localities in Secunderabad do you cover?",
    answer: "We cover all major parts of Secunderabad including Begumpet, Secunderabad Station/HO, Bowenpally, Sainikpuri, Marredpally, ECIL, AS Rao Nagar, Neredmet, Sitaphalmandi, Bolaram, and surrounding areas. Enter your 6-digit PIN code at the top of our site to confirm instant eligibility."
  },
  {
    question: "Can I send flowers and a cake together as a combo?",
    answer: "Yes, our cake with flowers combos are among our bestsellers! Choose from classic Dutch Truffle, Black Forest, Red Velvet, Pineapple, or Butterscotch cakes paired with vibrant red roses, exotic lilies, or mixed floral bouquets, along with personalized greeting cards."
  },
  {
    question: "Where is SB Florist located in Hyderabad?",
    answer: "Our flagship floral studio is located at Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028. You can also reach our customer support directly at +91 9949683222 for custom flower styling and urgent orders."
  }
];

const POPULAR_LOCALITIES_HYD = [
  "Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur", 
  "Mehdipatnam", "Hitec City", "Kukatpally", "Somajiguda", "Himayatnagar",
  "Begumpet", "Manikonda", "Miyapur", "Tolichowki", "Dilsukhnagar"
];

const POPULAR_LOCALITIES_SEC = [
  "Secunderabad HO", "Sainikpuri", "Marredpally", "Bowenpally", "ECIL", 
  "AS Rao Nagar", "Neredmet", "Bolaram", "Sitaphalmandi", "Rail Nilayam", 
  "Lallaguda", "Tarkana", "Kompally", "Alwal", "Malkajgiri"
];

export const HomeSeoSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/20 to-white py-16 md:py-24 border-t border-rose-100/60">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-200/25 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-rose-200/70">
            <Sparkles className="w-3.5 h-3.5" />
            Hyderabad & Secunderabad's Trusted Local Florist
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Send Fresh Flowers, Delicious Cakes & Gifts Across{' '}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              Hyderabad & Secunderabad
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Welcome to <strong className="font-semibold text-slate-800">SB Florist</strong>, your neighborhood floral studio delivering hand-tied bouquets, luscious artisanal cakes, and luxury gift hampers throughout the Twin Cities with precision same-day and midnight delivery.
          </p>
        </div>

        {/* Benefits Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1st Order Free Delivery</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Enjoy ₹0 delivery fee on your first order! Plus free standard delivery on orders ₹999+ across Twin Cities.
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Midnight & Same-Day</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Order by afternoon for same-day delivery, or book a 11 PM – 12 AM Midnight Surprise for unforgettable celebrations.
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Farm-Fresh Florals</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Dutch roses, oriental lilies, carnations, and orchids arranged by master florists at our Mehdipatnam design studio.
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Cake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cakes With Flowers</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Pair freshly baked Dutch Truffle, Red Velvet, or Pineapple cakes with custom bouquets and chocolates in one order.
            </p>
          </div>
        </div>

        {/* Twin Cities Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Hyderabad Spotlight */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/30 border border-rose-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Hyderabad City
                </span>
                <span className="text-xs font-medium text-slate-500">50+ Localities Served</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Online Flower & Cake Delivery in Hyderabad
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Whether you need elegant red roses in <strong>Banjara Hills</strong>, celebratory bouquets in <strong>Jubilee Hills</strong>, gourmet cakes delivered to <strong>Gachibowli & Madhapur tech corridors</strong>, or traditional celebrations in <strong>Mehdipatnam & Old City</strong>, SB Florist ensures hand-delivered freshness with live tracking.
              </p>

              {/* Localities pill tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {POPULAR_LOCALITIES_HYD.slice(0, 10).map((area) => (
                  <span key={area} className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                    {area}
                  </span>
                ))}
                <span className="text-[11px] px-2 py-1 text-rose-600 font-semibold">+ more</span>
              </div>
            </div>

            <Link
              to="/flower-delivery-hyderabad"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-white border border-rose-200 text-rose-700 font-semibold text-sm hover:bg-rose-50/80 transition-colors group"
            >
              <span>Explore Hyderabad Flower Delivery Guide</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Secunderabad Spotlight */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/30 border border-sky-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Secunderabad Twin City
                </span>
                <span className="text-xs font-medium text-slate-500">Full Coverage</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Send Flowers & Gifts to Secunderabad
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                We take special pride in servicing our sister city. From <strong>Begumpet</strong> and <strong>Secunderabad HO</strong> to cantonment suburbs like <strong>Bowenpally, Sainikpuri, Marredpally, ECIL</strong>, and <strong>AS Rao Nagar</strong>, enjoy direct florist dispatch without third-party courier delays.
              </p>

              {/* Localities pill tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {POPULAR_LOCALITIES_SEC.slice(0, 10).map((area) => (
                  <span key={area} className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                    {area}
                  </span>
                ))}
                <span className="text-[11px] px-2 py-1 text-sky-600 font-semibold">+ more</span>
              </div>
            </div>

            <Link
              to="/flower-delivery-secunderabad"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 font-semibold text-sm hover:bg-sky-50/80 transition-colors group"
            >
              <span>Explore Secunderabad Flower Delivery Guide</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Occasions & Products Fast Links */}
        <div className="rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Popular Flowers, Occasions & Gifts in Hyderabad & Secunderabad
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Handpicked collections designed for every celebration and heartfelt expression.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a 
                href="tel:+919949683222" 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                +91 9949683222
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <Link to="/shop?category=Roses" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              🌹 Red Roses Delivery
            </Link>
            <Link to="/shop?category=Bouquets" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              💐 Fresh Hand Bouquets
            </Link>
            <Link to="/shop?category=Cakes" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              🎂 Cakes & Combos
            </Link>
            <Link to="/occasions/birthday" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              🎉 Birthday Flowers
            </Link>
            <Link to="/occasions/anniversary" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              💍 Anniversary Florals
            </Link>
            <Link to="/occasions/romance" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              ❤️ Romantic Surprises
            </Link>
            <Link to="/occasions/congratulations" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              ✨ Congratulations
            </Link>
            <Link to="/shop?category=Plants" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              🪴 Indoor Green Plants
            </Link>
            <Link to="/flower-delivery-hyderabad" className="p-3 rounded-xl bg-rose-50/70 text-rose-800 hover:bg-rose-100 transition-colors border border-rose-200 font-medium text-center">
              📍 Hyderabad Hub
            </Link>
            <Link to="/flower-delivery-secunderabad" className="p-3 rounded-xl bg-sky-50/70 text-sky-800 hover:bg-sky-100 transition-colors border border-sky-200 font-medium text-center">
              📍 Secunderabad Hub
            </Link>
            <Link to="/contact" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              📍 Studio Mehdipatnam
            </Link>
            <Link to="/shop" className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-100 font-medium text-slate-700 text-center">
              🎁 Complete Catalog
            </Link>
          </div>
        </div>

        {/* High-Intent FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Frequently Asked Questions About Delivery in Twin Cities
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about placing flower, cake, and gift orders with SB Florist.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_DATA.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden bg-white",
                    isOpen ? "border-rose-300 shadow-sm" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-800">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180 text-rose-600"
                      )} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical Florist Credentials Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 text-center text-xs text-slate-500 max-w-3xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700">
            SB Florist Studio: Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad 500028
          </p>
          <p>
            Serving: Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, Begumpet, Secunderabad, Sainikpuri, Marredpally, Bowenpally, ECIL & all Twin Cities pin codes.
          </p>
        </div>
      </div>
    </section>
  );
};
