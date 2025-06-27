import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import Cart from './Cart';
import useCart from '../hooks/use-cart';
import { useSettings } from '../contexts/SettingsContext';
import CategoryMenu from './CategoryMenu';

const MainLayout: React.FC = () => {
  const cartHook = useCart();
  const { homeSections } = useSettings();

  const enabledSections = homeSections.filter(section => section.enabled);
  const showFooter = enabledSections.some(section => section.type !== 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <div>
        <Navigation />
        <CategoryMenu />
      </div>
      <Cart
        isOpen={cartHook.isCartOpen}
        onClose={cartHook.closeCart}
        items={cartHook.items}
        onUpdateQuantity={cartHook.updateItemQuantity}
        onRemoveItem={cartHook.removeItem}
        itemCount={cartHook.itemCount}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout; 