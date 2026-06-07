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
  const { homeSections } = useSettings();
  const { pathname } = useLocation();

  const enabledSections = homeSections.filter(section => section.enabled);
  const showFooter = enabledSections.some(section => section.type !== 'hero');
  const isHomePage = pathname === '/';

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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 inset-x-0 z-50">
        {isHomePage && showAnnouncement && <AnnouncementBar />}
        <Navigation />
        {isHomePage && <CategoryMenu />}
      </div>
      <div 
        className={
          isHomePage 
            ? (showAnnouncement ? "h-[216px] sm:h-[224px] lg:h-[232px]" : "h-[176px] sm:h-[184px] lg:h-[192px]") 
            : "h-[104px] sm:h-[112px] lg:h-[120px]"
        } 
        aria-hidden="true" 
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout; 
