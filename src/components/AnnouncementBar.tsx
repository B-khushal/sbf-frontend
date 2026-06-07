import React, { useState, useEffect } from 'react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem('sbf_announcement_dismissed');
    if (isDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('sbf_announcement_dismissed', 'true');
    setIsVisible(false);
    // Dispatch a custom event to notify parent components of layout change
    window.dispatchEvent(new Event('announcementDismissed'));
  };

  if (!isVisible) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-pink-50 via-rose-100 to-pink-50 border-b border-rose-200/50 py-2.5 z-50">
      <div className="flex w-full overflow-hidden whitespace-nowrap">
        {/* Scrolling wrapper */}
        <div className="animate-marquee flex gap-8 select-none">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex items-center text-sm font-semibold text-emerald-900 tracking-wide">
              <span className="text-rose-500 mr-2">🎉</span>
              FREE DELIVERY on your First Order at Spring Blossoms Florist
              <span className="text-rose-400 font-serif italic ml-2">🌸 Spring Special 🌸</span>
              <span className="mx-6 text-rose-300">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-sm border border-rose-200/30 text-rose-900/60 hover:text-rose-950 transition-all duration-200 z-10 hover:scale-105"
        aria-label="Dismiss announcement"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
