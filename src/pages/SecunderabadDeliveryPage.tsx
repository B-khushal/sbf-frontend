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
  CheckCircle2, 
  ChevronDown, 
  Search, 
  PhoneCall, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import PinCodeInput, { SERVICEABLE_PINCODES, ServiceablePinCode } from '@/components/ui/PinCodeInput';
import { cn } from '@/lib/utils';

const SECUNDERABAD_AREAS = [
  "Begumpet Policelines", "Secunderabad HO / Station", "Bowenpally", "New Bowenpally",
  "Sainikpuri", "West Marredpally", "East Marredpally", "ECIL", "AS Rao Nagar",
  "Neredmet", "Ramakrishna Puram", "Bolaram", "Sitaphalmandi", "Rail Nilayam",
  "Lallaguda", "Himmatnagar", "Mehrunagar", "Ferozguda", "JJ Nagar Colony",
  "Allembylines", "Jawahar Nagar", "Saket", "Tarnaka", "Kompally",
  "Alwal", "Malkajgiri", "Safilguda", "Karkhana", "Trimulgherry"
];

const FAQS_SEC = [
  {
    q: "Do you offer direct flower and cake delivery to Secunderabad?",
    a: "Yes! SB Florist provides direct, reliable flower, cake, and gift delivery throughout Secunderabad. We do not use third-party postal courier services; our dedicated delivery partners hand-deliver fresh, climate-controlled arrangements directly from our floral hub to your recipient."
  },
  {
    q: "Can I get same-day flower delivery in Secunderabad?",
    a: "Absolutely. Same-day delivery is available across all Secunderabad postal codes for orders placed during our daytime business hours (9:00 AM - 6:00 PM). Freshly arranged bouquets and baked cakes are dispatched for swift, prompt arrival."
  },
  {
    q: "How much are the delivery charges for Secunderabad?",
    a: "We offer Free Delivery on your 1st order for all new customers! For all subsequent orders, delivery is completely FREE on orders of ₹999 and above. Orders below ₹999 have a standard delivery fee of ₹150. Optional special slots such as Midnight Surprise (11:00 PM – 11:59 PM) and hourly Fixed Time Delivery can be selected at checkout."
  },
  {
    q: "Is midnight flower delivery available in Secunderabad areas like Sainikpuri or Marredpally?",
    a: "Yes! Our Midnight Delivery slot covers all major Secunderabad neighborhoods including Sainikpuri, West Marredpally, East Marredpally, Begumpet, Bowenpally, ECIL, and Neredmet. Deliveries arrive between 11:00 PM and 11:59 PM to surprise your loved ones right at midnight."
  },
  {
    q: "What types of flower and cake combos are available for delivery in Secunderabad?",
    a: "We offer an extensive selection of combos: fresh red Dutch roses paired with decadent Dutch Truffle cake, oriental pink lilies with Red Velvet cake, mixed exotic carnations and gerberas with Black Forest cake, and premium assorted chocolate hampers. Each order includes a complimentary personalized gift message card."
  },
  {
    q: "How do I check if my Secunderabad PIN code is serviceable?",
    a: "Simply enter your 6-digit PIN code (such as 500003, 500009, 500010, 500011, 500015, 500016, 500017, 500025, 500026, 500042, 500056, 500061, 500062, 500071, 500087, 500094, 500102, or 500103) into the pincode checker above for instant confirmation."
  }
];

export const SecunderabadDeliveryPage: React.FC = () => {
  const [testPin, setTestPin] = useState('');
  const [pinResult, setPinResult] = useState<ServiceablePinCode | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [areaFilter, setAreaFilter] = useState('');

  const filteredAreas = SECUNDERABAD_AREAS.filter(area => 
    area.toLowerCase().includes(areaFilter.toLowerCase())
  );

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Florist",
        "@id": "https://sbflorist.in/flower-delivery-secunderabad#florist",
        "name": "SB Florist Secunderabad",
        "url": "https://sbflorist.in/flower-delivery-secunderabad",
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
          "name": "Secunderabad"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://sbflorist.in/flower-delivery-secunderabad#breadcrumb",
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
            "name": "Flower Delivery in Secunderabad",
            "item": "https://sbflorist.in/flower-delivery-secunderabad"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://sbflorist.in/flower-delivery-secunderabad#faq",
        "mainEntity": FAQS_SEC.map(faq => ({
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
        <title>Flower Delivery in Secunderabad | Send Flowers, Cakes & Gifts | SB Florist</title>
        <meta 
          name="description" 
          content="Send fresh flowers, delicious cakes & gifts to Secunderabad with SB Florist. Free delivery on 1st order & orders ₹999+. Same-day & midnight flower delivery to Begumpet, Sainikpuri, Marredpally, ECIL & Bowenpally." 
        />
        <meta 
          name="keywords" 
          content="Flower Delivery in Secunderabad, Send Flowers to Secunderabad, Online Gifts Secunderabad, Same Day Flower Delivery Secunderabad, Fresh Flowers in Secunderabad, Cakes with Flowers Secunderabad, Birthday Gifts Secunderabad, Anniversary Gifts Secunderabad, Florist in Secunderabad, Online Flowers Secunderabad" 
        />
        <link rel="canonical" href="https://sbflorist.in/flower-delivery-secunderabad" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Flower Delivery in Secunderabad | Send Flowers & Cakes Online | SB Florist" />
        <meta property="og:description" content="Send fresh flowers, cakes, and gifts across Secunderabad. Enjoy Free Delivery on your 1st order and orders ₹999+. Same-day and midnight surprise delivery." />
        <meta property="og:url" content="https://sbflorist.in/flower-delivery-secunderabad" />
        <meta property="og:site_name" content="SB Florist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flower Delivery in Secunderabad | SB Florist" />
        <meta name="twitter:description" content="Order flowers, cakes, and gift combos online with same-day and midnight delivery across Secunderabad." />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Flower Delivery in Secunderabad</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50/30 py-12 md:py-20 border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Direct Florist Dispatch to Secunderabad Twin City
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Send Flowers & Cakes to <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Secunderabad</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                Looking to surprise loved ones in Secunderabad with blooming floral arrangements and fresh bakery cakes? SB Florist delivers handcrafted bouquets, birthday surprises, anniversary flowers, and combo gifts throughout Secunderabad with precision same-day and midnight delivery.
              </p>

              {/* Perks Row */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-sky-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1st Order Free Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-sky-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free Delivery on ₹999+</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-sky-200/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Same-Day & Midnight Slots</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Order Flowers for Secunderabad</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+919949683222"
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-sky-600" />
                  <span>+91 9949683222</span>
                </a>
              </div>
            </div>

            {/* Pincode Checker Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-sky-150/80">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-sky-600" />
                  <h2 className="text-lg font-bold text-slate-900">Verify Secunderabad Pincode</h2>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Check delivery timing and options for your specific Secunderabad address.
                </p>

                <div className="space-y-4">
                  <PinCodeInput
                    value={testPin}
                    onChange={setTestPin}
                    onSelectPinCode={(selection) => setPinResult(selection)}
                    placeholder="Enter PIN code (e.g. 500003, 500094)"
                  />

                  {pinResult && (
                    <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5 animate-fade-in">
                      <p className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
                        <CheckCircle2 className="w-4 h-4" /> Serviceable in {pinResult.area}!
                      </p>
                      <p className="text-emerald-700">
                        Location: <strong>{pinResult.city}</strong> ({pinResult.code})
                      </p>
                      <p className="text-emerald-700">
                        ✓ Free delivery on 1st order & orders ₹999+
                      </p>
                      <p className="text-emerald-700">
                        ✓ Same-Day & Midnight Surprise delivery available
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      to="/shop"
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center block transition-colors"
                    >
                      Browse Catalog for Secunderabad
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
                Fresh Flowers Delivered Seamlessly Across Secunderabad
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  As the historic sister city to Hyderabad, <strong>Secunderabad</strong> is home to charming cantonment tree-lined boulevards, quiet residential enclaves like <strong>Sainikpuri and Marredpally</strong>, bustling transit junctions around <strong>Secunderabad Railway Station</strong>, and thriving communities across <strong>Begumpet, Bowenpally, ECIL, and AS Rao Nagar</strong>.
                </p>
                <p>
                  At <strong>SB Florist</strong>, we treat Secunderabad with the dedicated attention it deserves. While some portals list Secunderabad as an afterthought and rely on courier packages that arrive days late with squashed flowers, our localized dispatch system delivers farm-fresh blooms directly to your recipient's home or workplace within hours.
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Bouquets, Roses & Baskets</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Stunning Dutch red roses, exotic Asiatic and oriental lilies, carnations, and vibrant gerberas hand-arranged by master artisans for birthdays, anniversaries, and romantic surprises.
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
                  Freshly baked eggless and regular cakes including Dutch Truffle, Belgian Chocolate, Red Velvet, Pineapple, and Butterscotch delivered alongside your floral surprise.
                </p>
                <Link to="/shop?category=Combos" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 mt-3">
                  Shop Combos <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Same-Day & Midnight Slots</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Need flowers in Secunderabad today? Order by daytime for guaranteed same-day delivery. Want to surprise someone right at 12:00 AM? Book our 11:00 PM – 11:59 PM midnight slot.
                </p>
                <span className="inline-block text-xs font-semibold text-purple-600 mt-3">
                  Timely Hand Delivery
                </span>
              </div>

              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">1st Order Free & Orders ₹999+ Free</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enjoy Free Delivery on your 1st order as a new customer! Standard delivery is also FREE on all orders of ₹999 and above (₹150 for orders below ₹999).
                </p>
                <span className="inline-block text-xs font-semibold text-emerald-600 mt-3">
                  Transparent Delivery Pricing
                </span>
              </div>
            </div>

            {/* Secunderabad Localities Directory */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Secunderabad Delivery Localities & Postal Zones
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Covering {SECUNDERABAD_AREAS.length}+ prominent neighborhoods across the cantonment and suburbs.
                  </p>
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    placeholder="Search locality..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {filteredAreas.map(area => (
                  <div key={area} className="p-2 rounded-lg bg-slate-50 border border-slate-150/70 text-slate-700 font-medium truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Quick Order Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-lg">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider">
                Secunderabad Florist
              </span>
              <h3 className="text-xl font-bold mt-3 leading-snug">
                Send Flowers & Cakes to Secunderabad Today
              </h3>
              <p className="text-xs text-sky-100 mt-2 leading-relaxed">
                Free delivery on your 1st order. Order early for guaranteed same-day delivery right to their doorstep.
              </p>
              <Link
                to="/shop"
                className="mt-5 w-full py-3 rounded-xl bg-white text-sky-800 font-bold text-xs text-center block shadow-sm hover:bg-sky-50 transition-colors"
              >
                Browse Best Sellers
              </Link>
            </div>

            {/* Hyderabad Cross-link */}
            <div className="rounded-3xl p-6 bg-white border border-rose-200 shadow-xs">
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
                Twin City Hub
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-3">
                Sending Flowers to Hyderabad?
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                We also provide extensive coverage across Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, and 50+ Hyderabad localities.
              </p>
              <Link
                to="/flower-delivery-hyderabad"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                <span>Visit Hyderabad Delivery Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Store Details */}
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
                  <strong className="text-slate-800">Coverage:</strong> All Secunderabad & Hyderabad PIN codes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* High-Intent FAQ Accordion */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Secunderabad Flower Delivery FAQs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find quick answers to common questions about ordering flowers and gifts in Secunderabad.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS_SEC.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden bg-white",
                    isOpen ? "border-sky-300 shadow-xs" : "border-slate-200 hover:border-slate-300"
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
                        isOpen && "rotate-180 text-sky-600"
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

export default SecunderabadDeliveryPage;
