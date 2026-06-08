import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, Gift, Sparkles, Clock, Star, PhoneCall, HelpCircle, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Heart,
  Clock,
  Star,
  Gift,
  PhoneCall,
  HelpCircle,
  ShieldCheck,
  Truck
};

const bentoItems = [
  {
    id: 'birthday',
    title: 'The Birthday Collection',
    subtitle: 'Make their day unforgettable with vibrant colors and sweet combos.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=birthday',
    gridClass: 'md:col-span-2 md:row-span-1',
    badge: '🎉 Festive',
    icon: Sparkles,
  },
  {
    id: 'anniversary',
    title: 'Romantic Anniversary Gifts',
    subtitle: 'Express everlasting love with classic roses and luxury hampers.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=anniversary',
    gridClass: 'md:col-span-1 md:row-span-2',
    badge: '💖 Best Seller',
    icon: Heart,
  },
  {
    id: 'midnight',
    title: 'Midnight Delivery Specials',
    subtitle: 'Surprise them right at 12:00 AM with fresh bouquets.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=roses',
    gridClass: 'md:col-span-1 md:row-span-1',
    badge: '🌙 Midnight',
    icon: Clock,
  },
  {
    id: 'luxury',
    title: 'Luxury Floral Masterpieces',
    subtitle: 'Elite arrangements curated by master designers using exotic blossoms.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=premium-collections',
    gridClass: 'md:col-span-2 md:row-span-1',
    badge: '✨ Luxury',
    icon: Star,
  },
  {
    id: 'personalized',
    title: 'Personalized Custom Gifts',
    subtitle: 'Custom photo cards, printed cushions, and floral gift sets.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=hampers',
    gridClass: 'md:col-span-1 md:row-span-1',
    badge: '🎁 Custom',
    icon: Gift,
  },
];

export const PromotionalBanners: React.FC = () => {
  const navigate = useNavigate();
  const { homeSections } = useSettings();

  const section = homeSections?.find(s => s.type === 'offers');
  const sectionTitle = section?.title || 'Perfect Gifts for Cherished Moments';
  const sectionSubtitle = section?.subtitle || 'Discover handpicked floral collections designed to convey every shade of sentiment.';

  const items = section?.content?.items && section.content.items.length > 0
    ? section.content.items
    : bentoItems;

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-white relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf2f8] px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#db2777] uppercase mb-4">
            <Gift className="h-3 w-3" />
            Curated Gifting Banners
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {items.map((item: any, idx: number) => {
            const Icon = typeof item.icon === 'string' ? (ICON_MAP[item.icon] || Gift) : (item.icon || Gift);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                onClick={() => navigate(item.link)}
                className={`${item.gridClass} group relative rounded-[28px] overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 hover:shadow-xl transition-all duration-300`}
              >
                {/* Background Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                {/* Content Container */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10 text-white">
                  {/* Badge */}
                  <div className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
                    <Icon size={12} className="stroke-[2px]" />
                    {item.badge}
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight group-hover:text-pink-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-white/80 max-w-md line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                    
                    <div className="inline-flex items-center gap-1 text-xs font-semibold pt-2.5 text-white/90 group-hover:text-white transition-all">
                      Shop Collection
                      <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Inner border decoration */}
                <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 group-hover:border-white/30 transition-colors duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
