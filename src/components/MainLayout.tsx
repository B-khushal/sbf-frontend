import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import useCart, { useCartSelectors } from '../hooks/use-cart';
import { useSettings } from '../contexts/SettingsContext';
import CategoryMenu from './CategoryMenu';
import { AnnouncementBar } from './AnnouncementBar';

const MainLayout: React.FC = () => {
  const cartHook = useCart();
  const { itemCount } = useCartSelectors();
  const { homeSections, headerSettings } = useSettings();
  const { pathname } = useLocation();

  const enabledSections = homeSections.filter(section => section.enabled);
  const showFooter = enabledSections.some(section => section.type !== 'hero');
  const isHomePage = pathname === '/';

  const isAnnouncementEnabled = headerSettings?.announcementBar?.enabled ?? true;

  const [showAnnouncement, setShowAnnouncement] = useState(() => {
    return localStorage.getItem('sbf_announcement_dismissed') !== 'true';
  });

  useEffect(() => {
    const handleDismiss = () => {
      setShowAnnouncement(false);
    };
    window.addEventListener('announcementDismissed', handleDismiss);
    return () => {
      window.removeEventListener('announcementDismissed', handleDismiss);
    };
  }, []);

  const isAnnouncementVisible = isHomePage && isAnnouncementEnabled && showAnnouncement;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 inset-x-0 z-50">
        {isAnnouncementVisible && <AnnouncementBar />}
        <Navigation />
        {isHomePage && <CategoryMenu />}
      </div>
      <div 
        className={
          isHomePage 
            ? (isAnnouncementVisible 
                ? "h-[108px] md:h-[188px] lg:h-[196px]" 
                : "h-[68px] md:h-[140px] lg:h-[156px]") 
            : "h-[68px] sm:h-[76px] lg:h-[84px]"
        } 
        aria-hidden="true" 
      />
      <main className="flex-grow pb-[120px] md:pb-0">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout; 
