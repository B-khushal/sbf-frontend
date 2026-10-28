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
  PhoneCall,
  Flower2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Do you offer same-day flower delivery in Hyderabad?",
    answer: "Yes! Spring Blossoms Florist provides same-day flower, cake, and gift delivery across Hyderabad and Secunderabad. Simply place your order during daytime hours and select your preferred delivery time slot at checkout."
  },
  {
    question: "Can I schedule midnight cake and flower delivery in Hyderabad?",
    answer: "Absolutely. Our Midnight Surprise Delivery slot (11:00 PM – 11:59 PM) is available for birthdays, anniversaries, and romantic surprises across all major localities in Hyderabad and Secunderabad."
  },
  {
    question: "What are the delivery charges across Hyderabad and Secunderabad?",
    answer: "New customers enjoy Free Delivery on their 1st order! Additionally, standard delivery is FREE on all orders of ₹999 and above. Orders below ₹999 carry a nominal ₹150 delivery fee."
  },
  {
    question: "How do you keep flowers and cakes fresh during delivery?",
    answer: "Every bouquet is handcrafted using fresh-cut Dutch roses, lilies, orchids, and seasonal blooms shortly before dispatch from our Mehdipatnam studio. Cakes are sourced fresh and transported in temperature-controlled packaging."
  },
  {
    question: "Can I include a personalized message card with my gift?",
    answer: "Yes, every order includes a complimentary message card where you can add your custom note for the recipient during checkout."
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
            Hyderabad &amp; Secunderabad's Trusted Local Florist
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Send Fresh Flowers, Delicious Cakes &amp; Gifts Across{' '}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              Hyderabad &amp; Secunderabad
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Welcome to <strong className="font-semibold text-slate-800">Spring Blossoms Florist</strong>, your neighborhood floral studio delivering hand-tied bouquets, luscious artisanal cakes, and luxury gift hampers throughout the Twin Cities with precision same-day and midnight delivery.
          </p>
        </div>

        {/* Benefits Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-slate-900">1st Order Free Delivery</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Enjoy ₹0 delivery fee on your first order! Plus free standard delivery on orders ₹999+ across Twin Cities.
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-slate-900">Midnight &amp; Same-Day</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Order by afternoon for same-day delivery, or book an 11 PM – 12 AM Midnight Surprise for birthdays and anniversaries.
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-slate-900">Farm-Fresh Florals</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Dutch roses, oriental lilies, carnations, and orchids arranged by master florists at our Mehdipatnam design studio.
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-rose-150/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Cake className="w-5 h-5" />
            </div>
            <p className="text-base font-bold text-slate-900">Cakes With Flowers</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Pair freshly baked Dutch Truffle, Red Velvet, or Pineapple cakes with custom bouquets and chocolates in one order.
            </p>
          </div>
        </div>

        {/* Structured SEO Editorial Section 1: Bouquets & Roses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* H2: Shop Bouquets in Hyderabad */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-rose-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/50 mb-3">
                <Flower2 className="w-3.5 h-3.5" /> Handcrafted Floral Bouquets
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Shop Bouquets in Hyderabad
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Looking for fresh <strong>bouquets in Hyderabad</strong> or searching for a trusted <strong>florist in Hyderabad</strong>? At Spring Blossoms Florist, our master florists hand-craft vibrant bouquets using farm-fresh Dutch roses, delicate gypsophila (baby's breath), fragrant Asiatic lilies, and tropical orchids. Whether you need a birthday surprise, anniversary celebration, congratulations bouquet, or sympathy arrangement, we offer beautiful arrangements starting from under ₹1,000 with same-day delivery.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Link to="/bouquets" className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors">
                  All Flower Bouquets &rarr;
                </Link>
                <Link to="/shop/budget-friendly" className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors">
                  Under ₹1,000
                </Link>
                <Link to="/flower-baskets" className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors">
                  Flower Baskets
                </Link>
              </div>
            </div>
            <Link
              to="/bouquets"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-800 font-semibold text-sm transition-colors group"
            >
              <span>Explore All Flower Bouquets</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* H2: Find Your Perfect Roses Bouquet */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-rose-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/50 mb-3">
                <Heart className="w-3.5 h-3.5" /> Signature Rose Collections
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Find Your Perfect Roses Bouquet
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Roses express what words cannot. Discover our celebrated selection of <strong>roses in Hyderabad</strong>, ranging from classic 10 and 20 red rose bouquets to grand 50-stem presentations. Choose from passionate red roses, delicate pink roses, radiant yellow roses for friendship, and elegant white roses for peaceful congratulations.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                <Link to="/roses?color=red" className="text-xs p-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-center transition-colors">
                  🌹 Red Roses
                </Link>
                <Link to="/roses?color=pink" className="text-xs p-2.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold text-center transition-colors">
                  🌸 Pink Roses
                </Link>
                <Link to="/roses?color=yellow" className="text-xs p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-center transition-colors">
                  🌻 Yellow Roses
                </Link>
                <Link to="/roses?color=white" className="text-xs p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-center transition-colors">
                  🤍 White Roses
                </Link>
              </div>
            </div>
            <Link
              to="/roses"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-800 font-semibold text-sm transition-colors group"
            >
              <span>Browse All Rose Bouquets</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Structured SEO Editorial Section 2: Exotic Varieties & Cakes/Combos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* H2: Sunflowers, Lilies and Fresh Seasonal Flowers */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-amber-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/50 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Exotic &amp; Seasonal Blooms
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Sunflowers, Lilies and Fresh Seasonal Flowers
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Brighten any room with golden <strong>sunflowers</strong>, magnificent oriental <strong>lilies</strong>, and lush <strong>hydrangeas</strong>. Our seasonal flower varieties are sourced directly from sustainable growers and kept in climate-regulated freshness chambers so your recipient receives long-lasting blossoms that open gracefully over days.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Link to="/sunflowers" className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold transition-colors">
                  🌻 Sunflower Bouquets
                </Link>
                <Link to="/lilies" className="text-xs px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 font-semibold transition-colors">
                  🌸 Lily Arrangements
                </Link>
                <Link to="/hydrangea" className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold transition-colors">
                  🪻 Hydrangea Collections
                </Link>
              </div>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 font-semibold text-sm transition-colors group"
            >
              <span>Explore Seasonal Flower Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* H2: Cakes and Flower Gift Combos */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-pink-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-800 border border-pink-200/50 mb-3">
                <Cake className="w-3.5 h-3.5" /> Patisserie &amp; Celebration Bundles
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Cakes and Flower Gift Combos
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Elevate your surprise with seamless <strong>cakes delivery in Hyderabad</strong> and our signature <strong>flower and cake combos</strong>. Enjoy gourmet cakes including Belgian Dark Chocolate Truffle, classic Black Forest, Red Velvet with cream cheese frosting, and fresh Pineapple cakes paired with fresh roses and chocolates.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Link to="/cakes" className="text-xs px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 font-semibold transition-colors">
                  🎂 Cakes in Hyderabad
                </Link>
                <Link to="/combos" className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold transition-colors">
                  🎁 Flower &amp; Cake Combos
                </Link>
                <Link to="/flower-baskets" className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors">
                  Gift Baskets &amp; Hampers
                </Link>
              </div>
            </div>
            <Link
              to="/combos"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-pink-50 hover:bg-pink-100/80 border border-pink-200 text-pink-800 font-semibold text-sm transition-colors group"
            >
              <span>Browse Celebration Combos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* H2: Flower Delivery Across Hyderabad & Secunderabad */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              Flower Delivery Across Hyderabad &amp; Secunderabad
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Fast, climate-conscious delivery directly from our Mehdipatnam floral studio to all major residential and commercial hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hyderabad Spotlight */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/30 border border-rose-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Hyderabad City
                  </span>
                  <span className="text-xs font-medium text-slate-500">50+ Localities Served</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Online Flower &amp; Cake Delivery in Hyderabad
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Whether you need romantic red roses in <strong>Banjara Hills</strong>, celebratory bouquets in <strong>Jubilee Hills</strong>, gourmet cakes delivered to <strong>Gachibowli &amp; Madhapur tech corridors</strong>, or traditional celebrations in <strong>Mehdipatnam &amp; Old City</strong>, Spring Blossoms Florist ensures hand-delivered freshness with live tracking.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
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
                <span>Explore Hyderabad Delivery Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Secunderabad Spotlight */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/30 border border-sky-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Secunderabad Twin City
                  </span>
                  <span className="text-xs font-medium text-slate-500">Full Coverage</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Send Flowers &amp; Gifts to Secunderabad
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  We take special pride in servicing our sister city. From <strong>Begumpet</strong> and <strong>Secunderabad HO</strong> to cantonment suburbs like <strong>Bowenpally, Sainikpuri, Marredpally, ECIL</strong>, and <strong>AS Rao Nagar</strong>, enjoy direct florist dispatch without third-party courier delays.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
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
                <span>Explore Secunderabad Delivery Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* H2: Frequently Asked Questions */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Frequently Asked Questions About Delivery in Hyderabad
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about placing flower, cake, and bouquet orders with Spring Blossoms Florist.
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
                  <h3 className="m-0">
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
                  </h3>
                  <div className={cn(
                    "px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3",
                    !isOpen && "hidden"
                  )}>
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical Florist Credentials Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 text-center text-xs text-slate-500 max-w-3xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700">
            Spring Blossoms Florist Studio: Pillar Number 32, Najam Centre, A/B, Door No. 12-2, 786, Rethi Bowli Road, Mehdipatnam, Hyderabad, Telangana 500006
          </p>
          <p>
            Serving: Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, Begumpet, Secunderabad, Sainikpuri, Marredpally, Bowenpally, ECIL &amp; all Twin Cities pin codes. Direct Helpline: <a href="tel:+919949683222" className="text-rose-600 font-semibold hover:underline">+91 9949683222</a>
          </p>
        </div>
      </div>
    </section>
  );
};
export default HomeSeoSection;
