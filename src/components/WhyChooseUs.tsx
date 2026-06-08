import React from 'react';
import { Truck, Sparkles, ShieldCheck, Heart, Star, Gift, PhoneCall, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Truck,
  Sparkles,
  ShieldCheck,
  Heart,
  Star,
  Gift,
  PhoneCall,
  HelpCircle
};

const trustItems = [
  {
    icon: Truck,
    title: 'Same-Day Hand Delivery',
    description: 'Freshness delivered directly to Hyderabad homes by our personal couriers.',
    bg: 'from-sky-50 to-blue-50/30',
    iconColor: 'text-sky-500 bg-sky-100/50',
  },
  {
    icon: Sparkles,
    title: '7-Day Freshness Guarantee',
    description: 'We source directly from premium growers to ensure lasting floral vibrancy.',
    bg: 'from-pink-50 to-rose-50/30',
    iconColor: 'text-pink-500 bg-pink-100/50',
  },
  {
    icon: ShieldCheck,
    title: '100% Safe Payments',
    description: 'We use enterprise bank-grade security to protect your transactions and details.',
    bg: 'from-emerald-50 to-teal-50/30',
    iconColor: 'text-emerald-500 bg-emerald-100/50',
  },
  {
    icon: Heart,
    title: 'Artisan Floral Designs',
    description: 'Each arrangement is uniquely crafted with artistic passion and care.',
    bg: 'from-purple-50 to-indigo-50/30',
    iconColor: 'text-purple-500 bg-purple-100/50',
  },
];

export const WhyChooseUs: React.FC = () => {
  const { homeSections } = useSettings();
  
  const section = homeSections?.find(s => s.type === 'whychooseus');
  const sectionTitle = section?.title || 'Why Discerning Gift-Givers Choose Us';
  const sectionSubtitle = section?.subtitle || 'We elevate floral gifting into memorable luxury experiences, delivering beauty and joy with meticulous attention to detail.';
  
  const items = section?.content?.items && section.content.items.length > 0
    ? section.content.items
    : trustItems;

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#fafafc] to-white">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-88 h-88 rounded-full bg-pink-100/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-sky-100/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-gray-100 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#b53d69] uppercase mb-4 shadow-sm">
            <Star className="h-3 w-3 fill-current" />
            The SBF Promise
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, idx: number) => {
            const Icon = typeof item.icon === 'string' ? (ICON_MAP[item.icon] || Heart) : (item.icon || Heart);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group relative p-6 rounded-[24px] bg-gradient-to-br ${item.bg || 'from-slate-50 to-slate-100/35'} border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(244,114,182,0.08)] transition-all duration-300 overflow-hidden`}
              >
                {/* Background glow overlay */}
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Animated Icon Container */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconColor || 'text-primary bg-primary/10'} mb-6 transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                  <Icon size={22} className="stroke-[2px]" />
                </div>

                {/* Text Details */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors">
                  {item.description}
                </p>

                {/* Subtle border accent */}
                <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-transparent group-hover:border-primary/10 transition-colors duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
