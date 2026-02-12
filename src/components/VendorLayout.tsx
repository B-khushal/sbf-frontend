import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, BarChart2, DollarSign, Settings, LogOut, Package, Menu, X, Tag, Gift, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const VendorLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = React.useState(false);

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

  const NavLink = ({ to, icon: Icon, text, collapsed }: { to: string; icon: React.ElementType; text: string; collapsed?: boolean }) => (
    <Link
      to={to}
      className={cn(
        'flex items-center px-4 py-3 text-gray-700 hover:bg-primary-100 hover:text-primary-800 rounded-lg transition-all duration-200 group relative',
        location.pathname === to ? 'bg-primary-100 text-primary-800 font-semibold' : 'font-medium',
        collapsed && 'justify-center'
      )}
      onClick={() => setIsMobileSidebarOpen(false)}
      title={collapsed ? text : ''}
    >
      <Icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
      {!collapsed && <span>{text}</span>}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {text}
        </span>
      )}
    </Link>
  );

  const sidebarContent = (collapsed: boolean = false) => (
    <>
      <div className={cn("px-4 py-6", collapsed && "px-2")}>
        <h2 className={cn("text-2xl font-bold text-gray-800 transition-all duration-200", collapsed ? "text-center text-lg" : "")}>
          {collapsed ? 'VP' : 'Vendor Panel'}
        </h2>
      </div>
      <nav className="flex-1 px-2 space-y-2">
        {navLinks.map((link) => (
          <NavLink key={link.to} {...link} collapsed={collapsed} />
        ))}
      </nav>
      <div className="p-2">
        <Button 
          onClick={logout} 
          variant="ghost" 
          className={cn(
            "w-full text-gray-700 hover:bg-red-100 hover:text-red-800 transition-all duration-200",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className={cn("w-5 h-5", !collapsed && "mr-3")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Sidebar */}
      <div className={cn("fixed inset-0 z-40 flex md:hidden", isMobileSidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileSidebarOpen(false)} 
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          {sidebarContent(false)}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-shrink-0 transition-all duration-300",
        isDesktopSidebarCollapsed ? "md:w-20" : "md:w-64"
      )}>
        <div className="flex flex-col w-full border-r border-gray-200 bg-white relative">
          {sidebarContent(isDesktopSidebarCollapsed)}
          {/* Toggle Button for Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-100 z-10"
            title={isDesktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isDesktopSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="md:hidden flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Vendor Panel</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;