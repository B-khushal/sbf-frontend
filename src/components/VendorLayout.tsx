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

  React.useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  React.useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

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
    <div className="dashboard-shell flex">
      {/* Mobile Sidebar */}
      <div className={cn("fixed inset-0 z-sheet bg-black/60 transition-opacity md:hidden", isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setIsMobileSidebarOpen(false)} />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-sheet flex w-[85vw] max-w-xs flex-col bg-white shadow-xl transition-transform duration-300 md:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="touch-action-btn"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 sidebar-scrollable pb-4">
          {sidebarContent(false)}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-shrink-0 transition-all duration-300 sticky top-0 h-screen",
        isDesktopSidebarCollapsed ? "md:w-20" : "md:w-64"
      )}>
        <div className="flex flex-col w-full border-r border-gray-200 bg-white relative">
          <div className="flex-1 sidebar-scrollable pb-4">{sidebarContent(isDesktopSidebarCollapsed)}</div>
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

      <div className="dashboard-main flex flex-col">
        <div className="md:hidden flex justify-between items-center bg-white border-b border-gray-200 px-3 py-2.5 sticky top-0 z-nav shadow-sm">
          <h2 className="text-base font-bold text-gray-800">Vendor Panel</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(true)} className="touch-action-btn">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <main className="panel-content flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
