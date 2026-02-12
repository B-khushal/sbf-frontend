import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, BarChart2, DollarSign, Settings, LogOut, Package, Menu, X, Tag, Gift, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const VendorLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navLinks = [
    { to: '/vendor/dashboard', icon: Home, text: 'Dashboard' },
    { to: '/vendor/products', icon: Package, text: 'Products' },
    { to: '/vendor/orders', icon: ShoppingCart, text: 'Orders' },
    { to: '/vendor/analytics', icon: BarChart2, text: 'Analytics' },
    { to: '/vendor/promocodes', icon: Tag, text: 'Promo Codes' },
    { to: '/vendor/offers', icon: Gift, text: 'Offers' },
    { to: '/vendor/holidays', icon: Calendar, text: 'Holidays' },
    { to: '/vendor/payouts', icon: DollarSign, text: 'Payouts' },
    { to: '/vendor/settings', icon: Settings, text: 'Settings' },
  ];

  const NavLink = ({ to, icon: Icon, text }: { to: string; icon: React.ElementType; text: string }) => (
    <Link
      to={to}
      className={cn(
        'flex items-center px-4 py-3 text-gray-700 hover:bg-primary-100 hover:text-primary-800 rounded-lg transition-colors duration-200',
        location.pathname === to ? 'bg-primary-100 text-primary-800 font-semibold' : 'font-medium'
      )}
      onClick={() => setIsSidebarOpen(false)}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{text}</span>
    </Link>
  );

  const sidebarContent = (
    <>
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800">Vendor Panel</h2>
      </div>
      <nav className="flex-1 px-2 space-y-2">
        {navLinks.map((link) => (
          <NavLink key={link.to} {...link} />
        ))}
      </nav>
      <div className="p-2">
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-gray-700 hover:bg-red-100 hover:text-red-800">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Sidebar */}
      <div className={cn("fixed inset-0 z-40 flex md:hidden", isSidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
          {sidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          {sidebarContent}
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="md:hidden flex justify-between items-center bg-white border-b border-gray-200 px-4 py-2">
           <h2 className="text-xl font-bold text-gray-800">Vendor Panel</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;