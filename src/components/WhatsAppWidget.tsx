import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export const WhatsAppWidget: React.FC = () => {
  const { pathname } = useLocation();
  const { notificationsSettings } = useSettings();
  const [isHovered, setIsHovered] = useState(false);

  // Hidden on admin & vendor panels
  if (pathname.startsWith('/admin') || pathname.startsWith('/vendor')) {
    return null;
  }

  const config = notificationsSettings?.whatsappFloating;

  // Render nothing if disabled or missing config
  if (!config || config.enabled === false) {
    return null;
  }

  const {
    phoneNumber = '9949683222',
    position = 'right',
    message = "Hello! I'm interested in your flower arrangements.",
    showHoverCard = true,
    showFloatingAnimation = true,
    businessName = 'Spring Blossoms Florist',
    widgetTitle = 'WhatsApp Us',
    widgetSubtitle = 'Need help choosing flowers?',
    widgetSize = 'medium',
    iconStyle = 'circle',
    borderRadius = 12,
    shadowIntensity = 'medium',
    welcomeText = 'Chat with our floral experts.',
    ctaButtonText = 'Chat Now',
    onlineStatusText = 'Online',
    businessHoursMessage = 'Typically replies within minutes',
  } = config;

  // Construct WhatsApp Link
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  // Default country code to +91 (India) if it's exactly 10 digits long without code
  const phoneWithCC = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${phoneWithCC}?text=${encodeURIComponent(message)}`;

  // Size Class Map
  const sizeClasses = {
    small: {
      btn: 'h-11 w-11 text-xs',
      icon: 'w-5 h-5',
      pillGap: 'gap-1.5 px-3 py-1.5',
    },
    medium: {
      btn: 'h-14 w-14 text-sm',
      icon: 'w-6 h-6',
      pillGap: 'gap-2 px-4 py-2.5',
    },
    large: {
      btn: 'h-16 w-16 text-base',
      icon: 'w-8 h-8',
      pillGap: 'gap-2.5 px-5 py-3',
    },
  }[widgetSize] || {
    btn: 'h-14 w-14 text-sm',
    icon: 'w-6 h-6',
    pillGap: 'gap-2 px-4 py-2.5',
  };

  // Shadow Map
  const shadowClasses = {
    low: 'shadow-sm',
    medium: 'shadow-md shadow-emerald-950/10',
    high: 'shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/30',
  }[shadowIntensity] || 'shadow-md';

  const positionClass = position === 'left'
    ? 'left-6 md:left-8 bottom-[80px] md:bottom-8'
    : 'right-6 md:right-8 bottom-[80px] md:bottom-8';

  const alignmentClass = position === 'left' ? 'items-start' : 'items-end';

  const cardPositionClass = position === 'left'
    ? 'left-0 origin-bottom-left'
    : 'right-0 origin-bottom-right';

  return (
    <div
      className={`fixed z-50 flex flex-col ${positionClass} ${alignmentClass} transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Self-contained breathing keyframe style */}
      {showFloatingAnimation && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes wa-widget-breath {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .wa-widget-breath {
            animation: wa-widget-breath 3.5s ease-in-out infinite;
          }
        `}} />
      )}

      {/* Desktop Hover Contact Card */}
      {showHoverCard && (
        <div
          className={`hidden lg:block absolute bottom-full pb-4 transition-all duration-300 origin-bottom ${cardPositionClass} ${
            isHovered
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          <div
            className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-2xl"
            style={{ borderRadius: `${borderRadius}px` }}
          >
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 11.998.953 6.559.953 2.134 5.326 2.13 10.757c-.001 1.701.453 3.361 1.314 4.816l-.99 3.616 3.603-.978z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{businessName}</h4>
                <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {onlineStatusText} • {widgetTitle}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] max-w-[85%] relative before:content-[''] before:absolute before:top-3 before:-left-2 before:border-8 before:border-transparent before:border-r-white dark:before:border-r-slate-900">
                <p className="text-xs text-slate-500 font-semibold dark:text-slate-400 mb-1">{widgetSubtitle}</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{welcomeText}</p>
                <span className="block text-[9px] text-slate-400 text-right mt-1.5">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 italic text-center leading-tight">
                {businessHoursMessage}
              </p>

              {/* CTA Link Button inside card */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.012 2.004c-5.508 0-9.988 4.48-9.988 9.988 0 1.76.46 3.48 1.332 5l-1.42 5.196 5.316-1.392c1.472.804 3.128 1.228 4.76 1.228h.004c5.508 0 9.988-4.48 9.988-9.988 0-2.66-1.036-5.16-2.92-7.044-1.884-1.884-4.384-2.92-7.072-2.92zM12.008 20.2c-1.492 0-2.956-.4-4.24-1.156l-.304-.18-3.152.824.84-3.072-.2-.316a8.21 8.21 0 01-1.256-4.388c.004-4.544 3.7-8.236 8.248-8.236 2.2 0 4.272.86 5.828 2.416a8.16 8.16 0 012.416 5.828c-.004 4.54-3.7 8.232-8.24 8.232zm4.52-6.176c-.248-.124-1.464-.724-1.692-.808-.228-.084-.396-.124-.564.124-.168.248-.648.808-.796.976-.148.168-.296.188-.544.064-.248-.124-1.048-.388-1.996-1.236-.736-.656-1.232-1.468-1.376-1.716-.148-.248-.016-.38.108-.504.112-.112.248-.296.372-.444.124-.148.164-.248.248-.416.084-.168.04-.316-.02-.44-.06-.124-.564-1.36-.772-1.868-.204-.5-.428-.432-.564-.44-.116-.008-.248-.008-.38-.008-.132 0-.348.052-.528.252-.18.2-.688.672-.688 1.64 0 .968.704 1.9.8 2.032.096.132 1.388 2.12 3.36 2.972.468.2.836.32 1.12.412.472.148.9.128 1.24.08.38-.056 1.464-.6 1.668-1.18.204-.58.204-1.08.144-1.18-.06-.1-.228-.164-.476-.288z"/>
                </svg>
                {ctaButtonText}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button Toggle Trigger */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={(e) => {
          // If custom hover card is enabled, we prevent direct link click on desktop to let user hover/interact
          // but on mobile or keyboard activation we directly open WhatsApp URL
          if (showHoverCard && window.innerWidth >= 1024) {
            e.preventDefault();
            window.open(whatsappUrl, '_blank');
          }
        }}
        className={`flex items-center justify-center font-bold text-white transition-all duration-300 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 ${shadowClasses} ${
          showFloatingAnimation ? 'wa-widget-breath' : ''
        } ${
          iconStyle === 'pill'
            ? `rounded-full ${sizeClasses.pillGap} hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30`
            : `rounded-full ${sizeClasses.btn} hover:rotate-6 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/30`
        }`}
        style={{ borderRadius: iconStyle === 'pill' ? '9999px' : `${borderRadius}px` }}
      >
        <svg
          className={`${sizeClasses.icon} fill-white flex-shrink-0`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {iconStyle === 'pill' && (
          <span className="font-bold tracking-wide select-none truncate">
            {ctaButtonText}
          </span>
        )}
      </a>
    </div>
  );
};

export default WhatsAppWidget;
