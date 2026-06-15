import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExitIntentPopupProps {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  code?: string;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  enabled,
  title = "Wait! Don't Go Empty-Handed...",
  subtitle = "Reveal a special 15% discount for your valentine. Make their day extra bright!",
  code = "LOVE15"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    // Check if shown this session
    const hasBeenShown = sessionStorage.getItem('sbf_valentine_exit_popup_shown');
    if (hasBeenShown === 'true') return;

    const handleMouseLeave = (e: MouseEvent) => {
      // If cursor leaves client area (y < 0 or close to 0)
      if (e.clientY <= 15) {
        setIsOpen(true);
        sessionStorage.setItem('sbf_valentine_exit_popup_shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-rose-100 max-w-md w-full p-6 text-center space-y-6"
        >
          {/* Close button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <Heart size={32} className="fill-rose-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-gray-800 font-serif">{title}</h4>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>

          {/* Promo Code Box */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-dashed border-rose-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <span className="text-xs text-rose-500 uppercase tracking-widest font-bold">Use Coupon Code</span>
            <div className="bg-white border border-rose-100 rounded-xl px-6 py-2.5 text-xl font-black text-rose-600 tracking-wider shadow-sm select-all">
              {code}
            </div>
            <span className="text-xs text-gray-400">Apply at checkout page</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/valentine-special');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/25 hover:from-rose-700 hover:to-pink-700 transition-all duration-300"
            >
              Explore Valentine Offers
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 bg-transparent text-gray-500 hover:bg-gray-50 rounded-2xl font-medium transition-all duration-200"
            >
              No thanks, I'll browse regular shop
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Pure React Heart Confetti burst
interface ConfettiBurstProps {
  trigger: boolean;
}

export const LoveConfetti: React.FC<ConfettiBurstProps> = ({ trigger }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; rotation: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#f43f5e', '#ec4899', '#db2777', '#fb7185', '#fda4af', '#f472b6'];
    const pList = Array.from({ length: 45 }).map((_, i) => ({
      id: Math.random() + i,
      x: 30 + Math.random() * 40, // % from left (centered-ish)
      y: 90 + Math.random() * 10,  // % from top
      size: 10 + Math.random() * 20,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setParticles(pList);

    // Clear after animation finishes (duration is 2.5s max)
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2800);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: `${p.x}vw`, 
            y: '100vh',
            rotate: p.rotation
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1.2, 0.8],
            x: `${p.x + (Math.random() * 20 - 10)}vw`,
            y: `${20 + Math.random() * 30}vh`,
            rotate: p.rotation + 360
          }}
          transition={{
            duration: 2.2,
            delay: p.delay,
            ease: "easeOut"
          }}
          style={{ 
            position: 'absolute',
            color: p.color
          }}
        >
          <Heart 
            size={p.size} 
            className="fill-current" 
            style={{ 
              filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.1))'
            }} 
          />
        </motion.div>
      ))}
    </div>
  );
};

// Toast notification showing recent (mocked) purchases
interface RecentPurchasesProps {
  enabled: boolean;
}

const SAMPLE_PURCHASES = [
  { name: "Rahul", city: "Hyderabad", item: "Rose Day Red Rose Bouquet 🌹", time: "2 minutes ago" },
  { name: "Neha", city: "Secunderabad", item: "Love & Romance Hamper 🍫", time: "5 minutes ago" },
  { name: "Anish", city: "Gachibowli", item: "Premium Valentine Teddy & Rose Combo 🧸", time: "8 minutes ago" },
  { name: "Priya", city: "Jubilee Hills", item: "Custom Gift Box: Flowers & Greeting Card 💝", time: "11 minutes ago" },
  { name: "Vikram", city: "Kondapur", item: "Luxury Gold-Accent Crimson Rose Box ✨", time: "15 minutes ago" }
];

export const RecentPurchases: React.FC<RecentPurchasesProps> = ({ enabled }) => {
  const [currentToast, setCurrentToast] = useState<typeof SAMPLE_PURCHASES[0] | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const showRandomToast = () => {
      const randomItem = SAMPLE_PURCHASES[Math.floor(Math.random() * SAMPLE_PURCHASES.length)];
      setCurrentToast(randomItem);

      // Hide toast after 6 seconds
      setTimeout(() => {
        setCurrentToast(null);
      }, 6000);
    };

    // Initial delay
    const initialTimer = setTimeout(showRandomToast, 12000);

    // Setup interval to show every 30 seconds
    const interval = setInterval(showRandomToast, 35000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [enabled]);

  return (
    <AnimatePresence>
      {currentToast && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-rose-50 dark:border-gray-700 p-4 max-w-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/30 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
            <ShoppingBag size={18} className="fill-current text-rose-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 uppercase tracking-wide">
              <Sparkles size={10} className="text-rose-400 animate-spin-slow" />
              Recent Gifting
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              <strong>{currentToast.name}</strong> from {currentToast.city} purchased
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold truncate">
              {currentToast.item}
            </p>
            <span className="text-[10px] text-gray-400">{currentToast.time}</span>
          </div>
          <button 
            onClick={() => setCurrentToast(null)}
            className="text-gray-400 hover:text-gray-600 self-start"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Social proof widget (views count)
interface SocialProofProps {
  enabled: boolean;
}

export const SocialProofWidget: React.FC<SocialProofProps> = ({ enabled }) => {
  const [views, setViews] = useState(12);

  useEffect(() => {
    if (!enabled) return;

    // Simulate views changes randomly
    const interval = setInterval(() => {
      setViews((prev) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + change;
        return next > 3 ? next : 5;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100 shadow-sm">
      <Users size={12} className="animate-pulse text-rose-500" />
      <span>{views} people are looking at this right now</span>
    </div>
  );
};
