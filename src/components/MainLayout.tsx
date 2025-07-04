import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import Cart from './Cart';
import useCart, { useCartSelectors } from '../hooks/use-cart';
import { useSettings } from '../contexts/SettingsContext';
import CategoryMenu from './CategoryMenu';

const MainLayout: React.FC = () => {
  const cartHook = useCart();
  const { itemCount } = useCartSelectors();
  const { homeSections } = useSettings();
  const { pathname } = useLocation();

  const enabledSections = homeSections.filter(section => section.enabled);
  const showFooter = enabledSections.some(section => section.type !== 'hero');
  const isHomePage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50">
        <Navigation />
        {isHomePage && <CategoryMenu />}
      </div>
      <Cart
        isOpen={cartHook.isCartOpen}
        onClose={cartHook.closeCart}
        items={cartHook.items}
        onUpdateQuantity={cartHook.updateItemQuantity}
        onRemoveItem={cartHook.removeItem}
        itemCount={itemCount}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout; 