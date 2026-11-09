import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Sparkles, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Gift, 
  ChevronDown, 
  ArrowRight,
  Cake,
  Flame,
  Award
} from 'lucide-react';
import { getValentineWeekDays } from '@/utils/valentineCalendar';
import { cn } from '@/lib/utils';

interface ValentineSeoEditorialSectionProps {
  className?: string;
  isOffSeason?: boolean;
}

export const ValentineSeoEditorialSection: React.FC<ValentineSeoEditorialSectionProps> = ({ 
  className = '', 
  isOffSeason = false 
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const weekDays = getValentineWeekDays();
  const targetYear = weekDays[0]?.year || new Date().getFullYear();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const FAQS = [
    {
      q: "Do you offer midnight flower delivery on Valentine's Day in Hyderabad?",
      a: "Yes! Spring Blossoms Florist provides a dedicated 11:00 PM to 11:59 PM midnight delivery slot across all major areas in Hyderabad and Secunderabad, including Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, Hitec City, Mehdipatnam, and Kukatpally. Early booking is strongly recommended as Valentine's midnight slots fill rapidly."
    },
    {
      q: "Can I send gifts for all 7 days of Valentine's Week?",
      a: "Absolutely! You can schedule individual surprise deliveries starting from Rose Day (Feb 7), Propose Day (Feb 8), Chocolate Day (Feb 9), Teddy Day (Feb 10), Promise Day (Feb 11), Hug Day (Feb 12), and Kiss Day (Feb 13), leading up to Valentine's Day (Feb 14) with handcrafted roses, chocolates, and artisanal cakes."
    },
    {
      q: "What types of roses do you use in Valentine's bouquets?",
      a: "We exclusively handpick long-stem Dutch red roses, velvety garden roses, sweet blush pink roses, and radiant white blooms. Every stem is inspected for petal count, stem firmness, and vibrant coloring to guarantee a minimum vase life of 4 to 7 days."
    },
    {
      q: "Can I customize a cake and flower combo with a personalized message?",
      a: "Yes, every Valentine's order includes a complimentary keepsake greeting card where you can pen your heartfelt message. You can also customize your message piped on top of our celebration cakes (up to 30 characters)."
    },
    {
      q: "What are your delivery fees during Valentine's Week?",
      a: "First-time customers enjoy Free Delivery on their first order! Furthermore, standard delivery is FREE on all orders of ₹999 and above. Orders below ₹999 carry a nominal ₹150 delivery charge."
    }
  ];

  return (
    <section className={cn("relative py-16 md:py-24 text-slate-900", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Off-season Banner if applicable */}
        {isOffSeason && (
          <div className="mb-12 p-6 rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-300/40 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Early Gifting &amp; Pre-Booking Active
            </span>
            <p className="text-sm md:text-base text-slate-700 font-medium max-w-2xl mx-auto">
              Our Valentine's catalog is accessible year-round for romance, anniversaries, and early {targetYear} reservations. Explore handcrafted bouquets or pre-book your surprise with guaranteed doorstep delivery.
            </p>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold tracking-widest uppercase mb-4 border border-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            Valentine's Day Gifts &amp; Flowers Guide
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Explore Valentine's Day Gifts to Make Every Moment Special
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Celebrate genuine affection with handcrafted Dutch red roses, heart-shaped Belgian chocolate cakes, cuddly teddy bears, and personalized keepsake cards by Hyderabad's premier floral studio.
          </p>
        </div>

        {/* Relationship-Based Gifting Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Find the Perfect Valentine's Gift for Your Loved One
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Tailored romantic expressions curated for every special bond.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Girlfriend */}
            <div className="rounded-3xl p-6 bg-white border border-rose-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 fill-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Valentine's Day Gifts for Girlfriend
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Surprise your girlfriend with blushing pink Dutch roses, heart-shaped Red Velvet cakes, imported chocolate bouquets, and sweet personalized keepsake cards.
                </p>
              </div>
              <Link 
                to="/roses?color=pink" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <span>Shop Girlfriend Gifts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Boyfriend */}
            <div className="rounded-3xl p-6 bg-white border border-rose-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Valentine's Day Gifts for Boyfriend
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Celebrate your boyfriend with gourmet Belgian chocolate hampers, sleek flower boxes, and thoughtful midnight surprise deliveries sent straight to his doorstep or workplace.
                </p>
              </div>
              <Link 
                to="/combos" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                <span>Shop Boyfriend Gifts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Wife */}
            <div className="rounded-3xl p-6 bg-white border border-rose-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Valentine's Day Gifts for Wife
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Honor your lifelong partner with majestic 50 or 100 long-stem red roses, luxurious orchid arrangements, and decadent cakes crafted with master patisserie skill.
                </p>
              </div>
              <Link 
                to="/roses" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 hover:underline"
              >
                <span>Shop Wife Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Husband */}
            <div className="rounded-3xl p-6 bg-white border border-rose-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Valentine's Day Gifts for Husband
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Express gratitude and romance with premium dry fruit &amp; chocolate hampers, fresh sunflower arrangements, and custom personalized message cards.
                </p>
              </div>
              <Link 
                to="/combos" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
              >
                <span>Shop Husband Gifts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Couples */}
            <div className="rounded-3xl p-6 bg-white border border-rose-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between sm:col-span-2 lg:col-span-2">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 fill-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Romantic Gifts for Couples
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Double the romance with complete celebration kits combining fragrant roses, decadent bakery cakes, Ferrero Rocher boxes, and romantic balloon decor for anniversary &amp; Valentine's fusion dates.
                </p>
              </div>
              <Link 
                to="/combos" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline"
              >
                <span>Browse Couple Gift Bundles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Beautiful Flowers & Rose Bouquets Section */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Beautiful Valentine's Day Flowers and Rose Bouquets
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Farm-fresh Dutch blooms handpicked for peak scent and longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl p-6 bg-gradient-to-b from-rose-50/60 to-white border border-rose-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Red Rose Bouquets</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Classic 12, 24, 50, and grand 100 Dutch red rose arrangements tied with luxury non-woven wrappers and delicate baby's breath.
              </p>
              <Link to="/roses?color=red" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                Explore Red Roses &rarr;
              </Link>
            </div>

            <div className="rounded-3xl p-6 bg-gradient-to-b from-pink-50/60 to-white border border-pink-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Valentine's Flower Arrangements</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Heart-shaped flower boxes, exotic purple orchids, oriental pink lilies, and bespoke vase arrangements designed for dining table statements.
              </p>
              <Link to="/bouquets" className="text-xs font-bold text-pink-700 hover:underline flex items-center gap-1">
                Explore Premium Arrangements &rarr;
              </Link>
            </div>

            <div className="rounded-3xl p-6 bg-gradient-to-b from-amber-50/60 to-white border border-amber-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Romantic Flower and Cake Combos</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                The quintessential duo: freshly assembled floral bouquets coupled with freshly baked Red Velvet, Black Forest, or Belgian Truffle cakes.
              </p>
              <Link to="/combos" className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1">
                Explore Flower &amp; Cake Combos &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* More Ways to Celebrate Valentine's Day */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              More Ways to Celebrate Valentine's Day
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Beyond traditional bouquets, explore delicious patisserie, plush keepsakes, and sweet surprises.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-2">🎂</div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Valentine's Day Cakes</h3>
              <p className="text-xs text-slate-500">Heart-shaped Dutch Truffle, Red Velvet &amp; Pineapple.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-2">🍫</div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Chocolates &amp; Sweet Surprises</h3>
              <p className="text-xs text-slate-500">Ferrero Rocher, Cadbury &amp; artisanal truffles.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Valentine's Gift Hampers</h3>
              <p className="text-xs text-slate-500">Luxury bundled floral baskets with sweets.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-2">🧸</div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Teddy Bears &amp; Decorations</h3>
              <p className="text-xs text-slate-500">Cuddly plush teddy bears &amp; romantic balloons.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-2">💌</div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Personalised Gifts</h3>
              <p className="text-xs text-slate-500">Custom message cards on luxury embossed cardstock.</p>
            </div>
          </div>
        </div>

        {/* Valentine's Week Gift Ideas — All 8 Days with Dynamic Calendar */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
              7 Days of Romance + Valentine's Day
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Valentine's Week Gift Ideas ({targetYear})
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every day of Valentine's Week holds a distinct meaning. Explore custom floral arrangements and sweet treats calibrated for each celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {weekDays.map((day) => (
              <div 
                key={day.id}
                className="rounded-3xl p-5 bg-white border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{day.icon}</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      {day.weekday}, Feb {day.dayNumber}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {day.name} Gifts
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    Target: {day.keyword}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {day.description}
                  </p>
                </div>
                <Link
                  to={`/shop?category=${day.targetCategory}`}
                  className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                >
                  <span>Explore {day.name} Specials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Budget-Based Gifting Section */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Find Valentine's Gifts Within Your Budget
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every gift expresses true sentiment, crafted to fit your budget perfectly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-xs text-center flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Pocket-Friendly</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Valentine's Gifts Under ₹500</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Single luxury Dutch roses, mini chocolate boxes, and heartfelt greeting card bundles.
                </p>
              </div>
              <Link to="/shop/budget-friendly" className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors">
                View Under ₹500
              </Link>
            </div>

            <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-xs text-center flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">Popular Choice</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Valentine's Gifts Under ₹1,000</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Fresh 10-rose bouquets, lovely carnation bunches, and mouthwatering mini celebration cakes.
                </p>
              </div>
              <Link to="/shop/budget-friendly" className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors">
                View Under ₹1,000
              </Link>
            </div>

            <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-xs text-center flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">Signature Bundles</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Valentine's Gifts Under ₹1,500</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  20 Dutch roses with Ferrero Rocher chocolates, half-kg Dutch Truffle cakes, and lily bouquets.
                </p>
              </div>
              <Link to="/combos" className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors">
                View Under ₹1,500
              </Link>
            </div>

            <div className="rounded-3xl p-6 bg-white border border-rose-300 shadow-sm text-center flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">Luxury Statements</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Valentine's Day Gifts</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Grand 50 &amp; 100 red roses, heart-shaped floral keepsake boxes, and multi-tier designer combos.
                </p>
              </div>
              <Link to="/roses" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors">
                Explore Premium
              </Link>
            </div>
          </div>
        </div>

        {/* Hyderabad Local Delivery Section */}
        <div className="mb-20 rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-rose-50 via-white to-pink-50 border border-rose-200">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-rose-700 mb-2">
              Twin Cities Express Delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
              Send Valentine's Day Flowers and Gifts in Hyderabad
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed mb-6">
              Spring Blossoms Florist handcrafts and delivers romantic gifts across 50+ localities in Hyderabad and Secunderabad, including Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, Hitec City, Kondapur, Mehdipatnam, Begumpet, Sainikpuri, and Kukatpally. Choose our signature <strong>Midnight Delivery Slot (11:00 PM – 11:59 PM)</strong> or flexible daytime delivery with live order tracking.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <Truck className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-900">1st Order Free Delivery</h4>
                <p className="text-[11px] text-slate-500 mt-1">₹0 delivery on 1st order and ₹999+ orders.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <Clock className="w-5 h-5 text-purple-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-900">Midnight Surprise Slot</h4>
                <p className="text-[11px] text-slate-500 mt-1">11:00 PM – 11:59 PM scheduled precision.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-rose-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-900">Farm Freshness Assured</h4>
                <p className="text-[11px] text-slate-500 mt-1">Dutch roses prepared right before dispatch.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Spring Blossoms Florist for Valentine's Day */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Choose Spring Blossoms Florist for Valentine's Day?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              The artisanal florist difference: authentic craftsmanship without third-party courier handling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl mb-2">🌸</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Authentic Local Studio</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operating from our design studio at Mehdipatnam, Hyderabad. Every bouquet is personally arranged by master florists.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl mb-2">✨</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Temperature-Care Transport</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flowers and cakes are transported carefully in climate-conscious vehicles to avoid petal wilting or frosting damage.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl mb-2">💌</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Free Personalized Card</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Include your personal message printed neatly on luxury embossed cardstock with every single Valentine order.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl mb-2">🛡️</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">On-Time Guarantee</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated dispatch fleet ensuring your surprise arrives right during your chosen morning, afternoon, or midnight window.
              </p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions About Valentine's Day Gifts */}
        <div className="mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions About Valentine's Day Gifts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about placing Valentine's flower and cake orders in Hyderabad.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden bg-white",
                    isOpen ? "border-rose-300 shadow-sm" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-800">
                      {faq.q}
                    </span>
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180 text-rose-600"
                      )} 
                    />
                  </button>
                  <div className={cn(
                    "px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3",
                    !isOpen && "hidden"
                  )}>
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explore More Flower and Gift Collections */}
        <div className="text-center pt-8 border-t border-slate-200">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Explore More Flower and Gift Collections
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/roses" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors">
              Rose Bouquets
            </Link>
            <Link to="/bouquets" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors">
              All Flower Bouquets
            </Link>
            <Link to="/cakes" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors">
              Celebration Cakes
            </Link>
            <Link to="/combos" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors">
              Flower &amp; Cake Combos
            </Link>
            <Link to="/flower-delivery-hyderabad" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors">
              Hyderabad Delivery Hub
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ValentineSeoEditorialSection;

