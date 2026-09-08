import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  Truck, 
  Heart, 
  Cake, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  Search, 
  PhoneCall, 
  ArrowRight,
  Star
} from 'lucide-react';
import PinCodeInput, { SERVICEABLE_PINCODES, ServiceablePinCode } from '@/components/ui/PinCodeInput';
import { cn } from '@/lib/utils';

const HYD_PINCODES = SERVICEABLE_PINCODES.filter(p => p.city === 'Hyderabad');

const HYDERABAD_AREAS = [
  "Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur",
  "Hitec City", "Mehdipatnam", "Somajiguda", "Himayatnagar", "Begumpet",
  "Kukatpally", "Miyapur", "Chandanagar", "Manikonda", "Tolichowki",
  "Attapur", "Masab Tank", "Khairatabad", "Ameerpet", "SR Nagar",
  "Panjagutta", "Dilsukhnagar", "Malakpet", "LB Nagar", "Saroornagar",
  "Amberpet", "Vidyanagar", "Barkatpura", "Narayanguda", "Abids",
  "Koti", "Charminar", "Bahadurpura", "Falaknuma", "Santoshnagar",
  "Saidabad", "Vanasthalipuram", "Hayathnagar", "Nagole", "Uppal",
  "Boduppal", "Peerzadiguda", "Nacharam", "Mallapur", "Tarnaka",
  "Habsiguda", "Osmania University", "Gandhinagar", "Kavadiguda", "Musheerabad"
];

const FAQS = [
  {
    q: "Can I get same-day flower delivery in Hyderabad today?",
    a: "Yes! SB Florist offers guaranteed same-day flower delivery across all serviceable areas in Hyderabad. Simply place your order during daytime hours, and our florists will handcraft your bouquet with farm-fresh flowers and deliver it within a few hours."
  },
  {
    q: "How does the First Order Free Delivery work in Hyderabad?",
    a: "We welcome every new customer with Free Delivery on their very first order! For returning customers, standard delivery is completely FREE on all orders of ₹999 and above. Orders below ₹999 carry a nominal delivery charge of ₹150."
  },
  {
    q: "Do you deliver flowers and cakes at midnight in Hyderabad?",
    a: "Yes, our Midnight Surprise Delivery slot operates between 11:00 PM and 11:59 PM every night. It's the perfect way to wish your loved ones a Happy Birthday or Happy Anniversary as soon as midnight arrives. You can select the Midnight Delivery option at checkout."
  },
  {
    q: "Can I combine flowers with birthday or anniversary cakes in one delivery?",
    a: "Yes! We specialize in floral and bakery combos. Choose from mouthwatering Dutch Truffle, Belgian Chocolate, Red Velvet, Fresh Fruit, Black Forest, or Pineapple cakes paired with fresh red roses, lilies, or mixed bouquets, delivered simultaneously in pristine condition."
  },
  {
    q: "Where is SB Florist located in Hyderabad, and can I pick up flowers directly?",
    a: "Our floral studio is located at Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad 500028. You can order online for home delivery or contact us directly at +91 9949683222 for customized styling and studio inquiries."
  },
  {
    q: "Which areas in Hyderabad do you cover?",
    a: "We deliver across all prominent areas including Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, Hitec City, Kondapur, Mehdipatnam, Kukatpally, Dilsukhnagar, LB Nagar, Secunderabad, and 50+ other localities. Enter your 6-digit PIN code in our checker above to confirm instant eligibility."
  }
];

export const HyderabadDeliveryPage: React.FC = () => {
  const [testPin, setTestPin] = useState('');
  const [pinResult, setPinResult] = useState<ServiceablePinCode | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [areaFilter, setAreaFilter] = useState('');

  const filteredAreas = HYDERABAD_AREAS.filter(area => 
    area.toLowerCase().includes(areaFilter.toLowerCase())
  );

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Florist",
        "@id": "https://sbflorist.in/flower-delivery-hyderabad#florist",
        "name": "SB Florist Hyderabad",
        "url": "https://sbflorist.in/flower-delivery-hyderabad",
        "logo": "https://sbflorist.in/logo.png",
        "image": "https://sbflorist.in/logo.png",
        "telephone": "+91 9949683222",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam",
          "addressLocality": "Hyderabad",
          "addressRegion": "Telangana",
          "postalCode": "500028",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 17.3912,
          "longitude": 78.4326
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "09:00",
            "closes": "21:00"
          }
        ],
        "areaServed": {
          "@type": "City",
          "name": "Hyderabad"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://sbflorist.in/flower-delivery-hyderabad#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://sbflorist.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Flower Delivery in Hyderabad",
            "item": "https://sbflorist.in/flower-delivery-hyderabad"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://sbflorist.in/flower-delivery-hyderabad#faq",
        "mainEntity": FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Helmet>
        <title>Flower Delivery in Hyderabad | Send Flowers, Cakes & Gifts Online | SB Florist</title>
        <meta 
          name="description" 
          content="Best flower delivery in Hyderabad by SB Florist. Send fresh roses, bouquets, birthday flowers, anniversary cakes & combos. Free delivery on 1st order. Same-day & midnight delivery across Hyderabad." 
        />
        <meta 
          name="keywords" 
          content="Send Flowers to Hyderabad, Flower Delivery in Hyderabad, Online Flowers Hyderabad, Same Day Flower Delivery Hyderabad, Fresh Flowers Hyderabad, Online Cakes Hyderabad, Cakes with Flowers Hyderabad, Gifts to Hyderabad, Online Gifts Hyderabad, Birthday Flowers Hyderabad, Anniversary Flowers Hyderabad, Midnight Flower Delivery Hyderabad, Roses to Hyderabad, Bouquets to Hyderabad, Local Florist Hyderabad, Florist in Hyderabad, Hyderabad flower delivery" 
        />
        <link rel="canonical" href="https://sbflorist.in/flower-delivery-hyderabad" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Flower Delivery in Hyderabad | Send Flowers & Cakes Online | SB Florist" />
        <meta property="og:description" content="Send fresh flowers, cakes, and gifts across Hyderabad. Enjoy Free Delivery on your 1st order and orders ₹999+. Guaranteed same-day and midnight surprise delivery." />
        <meta property="og:url" content="https://sbflorist.in/flower-delivery-hyderabad" />
        <meta property="og:site_name" content="SB Florist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flower Delivery in Hyderabad | SB Florist" />
        <meta name="twitter:description" content="Order flowers, cakes, and gift combos online with same-day and midnight delivery in Hyderabad." />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Flower Delivery in Hyderabad</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50/40 py-12 md:py-20 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Handcrafted by Master Florists at Mehdipatnam Studio
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Online Flower Delivery in <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Hyderabad</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                Send breathtaking fresh flowers, artisanal cakes, and luxury gift hampers anywhere in Hyderabad. Whether celebrating birthdays, anniversaries, or spontaneous gestures of love, SB Florist guarantees hand-tied elegance and punctual same-day & midnight delivery.
              </p>

              {/* Perks Row */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1st Order Free Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free on Orders ₹999+</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Same-Day & Midnight Delivery</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Order Flowers Online</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+919949683222"
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span>+91 9949683222</span>
                </a>
              </div>
            </div>

            {/* Pincode Checker Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-rose-150/80">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <h2 className="text-lg font-bold text-slate-900">Check Hyderabad Delivery Pincode</h2>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Verify instant delivery availability and time slots for your exact locality.
                </p>

                <div className="space-y-4">
                  <PinCodeInput
                    value={testPin}
                    onChange={setTestPin}
                    onSelectPinCode={(selection) => setPinResult(selection)}
                    placeholder="Enter 6-digit PIN code (e.g. 500034)"
                  />

                  {pinResult && (
                    <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5 animate-fade-in">
                      <p className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
                        <CheckCircle2 className="w-4 h-4" /> Delivery Available to {pinResult.area}!
                      </p>
                      <p className="text-emerald-700">
                        City: <strong>{pinResult.city}</strong> ({pinResult.code})
                      </p>
                      <p className="text-emerald-700">
                        ✓ Free delivery on 1st order & orders ₹999+
                      </p>
                      <p className="text-emerald-700">
                        ✓ Same-Day Delivery & Midnight Surprise slot available
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      to="/shop"
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center block transition-colors"
                    >
                      Browse Flowers for Hyderabad Delivery
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Editorial Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                The Preferred Online Florist in Hyderabad
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  Flowers have an extraordinary way of transcending words, whether expressing romantic affection, extending heartfelt birthday greetings, marking wedding anniversaries, or conveying deep gratitude. As a genuine local florist situated at <strong>Najam Centre, Pillar No. 32, Mehdipatnam</strong>, <strong>SB Florist</strong> delivers fresh, fragrant botanicals across every corner of Hyderabad.
                </p>
                <p>
                  Unlike non-local aggregators that courier stale boxed flowers from distant warehouses, our bouquets are hand-tied on the day of delivery by professional florists using blooms harvested directly from regional farms. From velvety Dutch red roses and intoxicating oriental lilies to cheerful carnations and orchids, every floral arrangement radiates freshness and artistry.
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Roses, Bouquets & Baskets</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Classic 12, 24, 50, and 100 red roses arrangements, cascading mixed floral hampers, heart-shaped floral boxes, and glass vase displays designed to take your breath away.
                </p>
                <Link to="/shop?category=Roses" className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 mt-3">
                  Shop Roses <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <Cake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Cakes with Flowers Combos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Decadent Dutch Truffle, Black Forest, Red Velvet, Pineapple, and Butterscotch cakes made fresh on order. Delivered together with hand-tied blossoms in one flawless delivery.
                </p>
                <Link to="/shop?category=Combos" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 mt-3">
                  Shop Combos <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Same-Day & Midnight Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Urgent last-minute plans? Rely on our guaranteed daytime same-day dispatch. Planning a midnight birthday bash? Book our 11:00 PM – 11:59 PM surprise slot to ring in celebrations on time.
                </p>
                <span className="inline-block text-xs font-semibold text-purple-600 mt-3">
                  Available Across Hyderabad & Secunderabad
                </span>
              </div>

              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">1st Order Free & Transparent Fees</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enjoy Free Delivery on your 1st order as a new customer, and Free standard delivery on all orders ₹999 and above. No hidden surcharges or surprise billing at checkout.
                </p>
                <span className="inline-block text-xs font-semibold text-emerald-600 mt-3">
                  Standard ₹150 under ₹999
                </span>
              </div>
            </div>

            {/* Occasions Coverage */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                Flowers in Hyderabad for Every Occasion
              </h2>
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong>Birthday Flowers in Hyderabad:</strong> Bright sunflowers, joyful pink carnations, and vibrant mixed gerberas accompanied by designer birthday cakes and greeting cards.
                </p>
                <p>
                  <strong>Anniversary Flowers in Hyderabad:</strong> Passionate long-stemmed red roses, exotic purple orchids, and heart-shaped luxury arrangements that honor milestones in style.
                </p>
                <p>
                  <strong>Congratulatory & Corporate Gifting:</strong> Sophisticated lily baskets, indoor air-purifying plants, and executive floral designs for offices across Hitec City, Gachibowli, and Financial District.
                </p>
              </div>
            </div>

            {/* Covered Localities Directory */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Hyderabad Delivery Areas & Localities
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Covering {HYDERABAD_AREAS.length}+ key postal areas with verified local delivery partners.
                  </p>
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    placeholder="Search locality..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {filteredAreas.map(area => (
                  <div key={area} className="p-2 rounded-lg bg-slate-50 border border-slate-150/70 text-slate-700 font-medium truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Quick Order Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-lg">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider">
                Twin Cities Florist
              </span>
              <h3 className="text-xl font-bold mt-3 leading-snug">
                Send Fresh Flowers & Cakes to Hyderabad Today
              </h3>
              <p className="text-xs text-rose-100 mt-2 leading-relaxed">
                Free delivery on your first order. Order before 6:00 PM for guaranteed same-day doorstep delivery.
              </p>
              <Link
                to="/shop"
                className="mt-5 w-full py-3 rounded-xl bg-white text-rose-700 font-bold text-xs text-center block shadow-sm hover:bg-rose-50 transition-colors"
              >
                Browse Best Sellers
              </Link>
            </div>

            {/* Secunderabad Cross-link */}
            <div className="rounded-3xl p-6 bg-white border border-sky-200 shadow-xs">
              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wider">
                Sister City
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-3">
                Sending Flowers to Secunderabad?
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                We provide dedicated flower, cake, and gift deliveries throughout Secunderabad, Sainikpuri, Marredpally, Begumpet, and ECIL.
              </p>
              <Link
                to="/flower-delivery-secunderabad"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                <span>Visit Secunderabad Delivery Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Store Information */}
            <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Verified Florist Details
              </h4>
              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  <strong className="text-slate-800">Studio:</strong> Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32, Rethi Bowli, Mehdipatnam, Hyderabad 500028
                </p>
                <p>
                  <strong className="text-slate-800">Hours:</strong> Mon - Sun, 9:00 AM - 9:00 PM
                </p>
                <p>
                  <strong className="text-slate-800">Phone / WhatsApp:</strong> +91 9949683222
                </p>
                <p>
                  <strong className="text-slate-800">Delivery Scope:</strong> All pin codes across Hyderabad and Secunderabad
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* High-Intent FAQ Accordion */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Hyderabad Flower Delivery FAQs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Common questions answered regarding orders, delivery slots, and bouquets.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden bg-white",
                    isOpen ? "border-rose-300 shadow-xs" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {faq.q}
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
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HyderabadDeliveryPage;
