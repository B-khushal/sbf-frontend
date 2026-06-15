import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Timer, Gift, EyeOff } from 'lucide-react';
import type { ValentineDeliverySettings } from '@/types/valentine';

interface ValentineDeliveryOptionsProps {
  delivery: ValentineDeliverySettings;
}

const deliveryOptions = [
  {
    key: 'sameDay',
    icon: Clock,
    title: 'Same Day Delivery',
    description: 'Order before cutoff and receive today',
    gradient: 'from-sky-600/15 to-blue-600/15',
    iconColor: 'text-sky-400',
  },
  {
    key: 'midnight',
    icon: Moon,
    title: 'Midnight Delivery',
    description: 'Surprise at the stroke of midnight',
    gradient: 'from-indigo-600/15 to-violet-600/15',
    iconColor: 'text-indigo-400',
  },
  {
    key: 'fixedTime',
    icon: Timer,
    title: 'Fixed Time Delivery',
    description: 'Choose your preferred delivery time',
    gradient: 'from-emerald-600/15 to-teal-600/15',
    iconColor: 'text-emerald-400',
  },
  {
    key: 'surprise',
    icon: Gift,
    title: 'Surprise Delivery',
    description: 'We pick the perfect surprise moment',
    gradient: 'from-amber-600/15 to-orange-600/15',
    iconColor: 'text-amber-400',
  },
  {
    key: 'anonymous',
    icon: EyeOff,
    title: 'Anonymous Gift Delivery',
    description: 'Send gifts without revealing your identity',
    gradient: 'from-rose-600/15 to-pink-600/15',
    iconColor: 'text-rose-400',
  },
];

const ValentineDeliveryOptions: React.FC<ValentineDeliveryOptionsProps> = ({ delivery }) => {
  const enabledOptions = deliveryOptions.filter(opt => {
    const enabledKey = `${opt.key}Enabled` as keyof ValentineDeliverySettings;
    return delivery[enabledKey] as boolean;
  });

  if (enabledOptions.length === 0) return null;

  return (
    <section id="valentine-delivery" className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm uppercase tracking-[4px] text-rose-300/70 font-medium mb-3">
            Delivery
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] mb-4">
            Premium <span className="valentine-gradient-text">Delivery Options</span>
          </h2>
          <p className="text-rose-200/60 text-base md:text-lg max-w-2xl mx-auto">
            Choose how you want your love delivered – from same-day to midnight surprises.
          </p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {enabledOptions.map((opt, index) => {
            const chargeKey = `${opt.key}Charge` as keyof ValentineDeliverySettings;
            const charge = (delivery[chargeKey] as number) || 0;
            const cutoffKey = `${opt.key}Cutoff` as keyof ValentineDeliverySettings;
            const cutoff = delivery[cutoffKey] as string;
            const Icon = opt.icon;

            return (
              <motion.div
                key={opt.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`valentine-glass-dark rounded-2xl p-6 border border-rose-500/10 bg-gradient-to-br ${opt.gradient} hover:border-rose-400/20 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${opt.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1">{opt.title}</h3>
                    <p className="text-sm text-rose-200/50 mb-3">{opt.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${charge === 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
                        {charge === 0 ? 'FREE' : `+₹${charge}`}
                      </span>
                      {cutoff && (
                        <span className="text-xs text-rose-300/40">
                          Order by {cutoff}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValentineDeliveryOptions;
