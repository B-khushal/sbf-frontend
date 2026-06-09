import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const AnnouncementBar: React.FC = () => {
  const { headerSettings } = useSettings();
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

  const announcement = headerSettings?.announcementBar;
  const bgColor = announcement?.bgColor || 'linear-gradient(to right, #7dd3fc, #f9a8d4, #86efac)';
  const textColor = announcement?.textColor || '#ffffff';

  // Support list of announcements, falling back to single text, then default message
  const announcementsList = announcement?.texts && announcement.texts.length > 0
    ? announcement.texts
    : [announcement?.text || 'FREE DELIVERY on your First Order at Spring Blossoms Florist 🌸'];

  return (
    <div 
      className="relative w-full overflow-hidden border-b border-white/10 py-2.5 z-50 transition-all duration-300"
      style={{ background: bgColor }}
    >
      <div className="flex w-full overflow-hidden whitespace-nowrap pr-12">
        {/* Scrolling wrapper */}
        <div className="animate-marquee flex gap-12 select-none">
          {[...Array(2)].map((_, listIdx) => (
            <div key={listIdx} className="flex gap-12 items-center shrink-0">
              {announcementsList.map((text, textIdx) => (
                <span 
                  key={textIdx} 
                  className="flex items-center text-sm font-semibold tracking-wide"
                  style={{ color: textColor }}
                >
                  <span className="text-rose-500 mr-2">🎉</span>
                  {text}
                  <span className="mx-6 opacity-40">|</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 transition-all duration-200 z-10 hover:scale-105"
        style={{ color: textColor }}
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
