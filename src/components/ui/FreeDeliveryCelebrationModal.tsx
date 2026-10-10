import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Sparkles, CheckCircle2, X, Gift, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FreeDeliveryCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAmount?: number;
}

const FreeDeliveryCelebrationModal: React.FC<FreeDeliveryCelebrationModalProps> = ({
  isOpen,
  onClose,
  savedAmount = 150,
}) => {
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
          />

          {/* Light Theme Animated Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200/90 dark:border-emerald-500/30 overflow-hidden z-10 transform-gpu"
          >
            {/* Soft decorative background glows */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-100/70 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-teal-100/70 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer z-20"
            >
              <X size={18} />
            </button>

            {/* Content Container */}
            <div className="flex flex-col items-center text-center space-y-5 relative z-10">
              {/* Animated Icon Badge */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 240, damping: 18 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-50 dark:ring-emerald-950/40 border border-emerald-300/40">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md text-amber-950 font-bold border-2 border-white dark:border-slate-900">
                  <Sparkles size={16} />
                </div>
              </motion.div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                  <span>🎉</span> First Order Offer Unlocked!
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Free Delivery Applied!
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                  As a first-time customer at Spring Blossoms, your delivery fee has been 100% waived!
                </p>
              </div>

              {/* Savings Highlight Card */}
              <div className="w-full bg-slate-50 dark:bg-white/5 border border-emerald-200/80 dark:border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Gift size={14} className="text-emerald-600 dark:text-emerald-400" /> Standard Delivery Fee:
                  </span>
                  <span className="text-slate-400 dark:text-slate-400 line-through font-bold">₹{savedAmount}.00</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold border-t border-slate-200/80 dark:border-white/10 pt-2.5 text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /> First Order Benefit:
                  </span>
                  <span className="bg-emerald-500 text-white px-3 py-0.5 rounded-full shadow-sm font-extrabold text-xs">
                    ₹0 (FREE)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full pt-1">
                <Button
                  type="button"
                  onClick={onClose}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 border border-emerald-400/30 transition-all transform active:scale-95 cursor-pointer"
                >
                  Continue with Free Delivery ✨
                </Button>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                Guaranteed Fresh Flowers & Express Delivery
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FreeDeliveryCelebrationModal;
