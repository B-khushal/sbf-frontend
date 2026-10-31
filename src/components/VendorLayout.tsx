import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  BarChart2,
  DollarSign,
  Settings,
  LogOut,
  Package,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Store,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useNotification } from '@/contexts/NotificationContext';

const VendorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = React.useState(false);
  const { unreadCount } = useNotification();

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
    { to: '/vendor/profile', icon: User, text: 'Profile' },
    { to: '/vendor/payouts', icon: DollarSign, text: 'Payouts' },
    { to: '/vendor/settings', icon: Settings, text: 'Settings' },
  ];

  const NavLink = ({
    to,
    icon: Icon,
    text,
    collapsed
  }: {
    to: string;
    icon: React.ElementType;
    text: string;
    collapsed?: boolean;
  }) => {
    const isActive = location.pathname === to || (to !== '/vendor/dashboard' && location.pathname.startsWith(to));

    return (
      <Link
        to={to}
        className={cn(
          'flex items-center px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group relative',
          isActive
            ? 'sbf-nav-active font-semibold text-rose-600 bg-white/70'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40',
          collapsed && 'justify-center px-2'
        )}
        onClick={() => setIsMobileSidebarOpen(false)}
        title={collapsed ? text : ''}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
            isActive ? 'text-rose-600' : 'text-slate-500 group-hover:text-slate-800',
            !collapsed && 'mr-3'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        {!collapsed && <span className="truncate">{text}</span>}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {text}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (collapsed: boolean = false) => (
    <div className="flex flex-col h-full">
      {/* Brand & Vendor Badge */}
      <div className={cn('px-4 py-5 flex flex-col items-center border-b border-slate-200/60', collapsed && 'px-2 py-4')}>
        <Link to="/vendor/dashboard" className="flex items-center justify-center">
          <img
            src={
              collapsed
                ? 'https://res.cloudinary.com/djtrhfqan/image/upload/v1791793251/logo_f_without_bg_mdrtys.png'
                : 'https://res.cloudinary.com/djtrhfqan/image/upload/v1791793252/logo_final_tp7ymk.png'
            }
            alt="Spring Blossoms Florist Logo"
            className={cn(
              'transition-all duration-300 ease-in-out hover:scale-105 object-contain',
              collapsed ? 'h-9 w-9' : 'h-11 w-auto max-w-[190px]'
            )}
          />
        </Link>
        {!collapsed && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/50">
            <Store className="w-3 h-3 text-rose-600" />
            <span>Vendor Partner</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink key={link.to} {...link} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-200/60 space-y-2">
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-white/60 border border-slate-200/50 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {(user?.name || 'V').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Vendor Partner'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'vendor@sbflorist.in'}</p>
            </div>
          </div>
        )}

        <Button
          onClick={() => logout()}
          variant="ghost"
          className={cn(
            'w-full text-slate-600 hover:text-red-700 hover:bg-red-50/70 rounded-xl transition-all duration-200 text-sm font-medium',
            collapsed ? 'justify-center px-2' : 'justify-start px-3'
          )}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className={cn('w-4 h-4', !collapsed && 'mr-2.5 text-slate-400 group-hover:text-red-600')} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="sbf-dashboard-shell min-h-screen flex bg-[var(--sbf-canvas)] text-slate-800 antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isMobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-xs flex-col bg-[var(--sbf-canvas)] shadow-2xl transition-transform duration-300 ease-out md:hidden border-r border-slate-200/70',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-3.5 border-b border-slate-200/60">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor Navigation</span>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/60 active:scale-95 transition-all"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarContent(false)}
        </div>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col transition-all duration-300 sticky top-0 h-screen z-30 bg-[var(--sbf-canvas)] border-r border-slate-200/70 flex-shrink-0',
          isDesktopSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full relative">
          <div className="flex-1 overflow-y-auto">
            {sidebarContent(isDesktopSidebarCollapsed)}
          </div>

          {/* Sidebar Collapse Toggle Pill */}
          <button
            onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            className="absolute -right-3.5 top-6 h-7 w-7 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all z-40 hover:scale-105 active:scale-95"
            title={isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isDesktopSidebarCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Navbar */}
        <header className="md:hidden flex justify-between items-center bg-[var(--sbf-canvas)] border-b border-slate-200/70 px-4 py-3 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/70 border border-slate-200/70 text-slate-700 hover:text-slate-900 active:scale-95 transition-all"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-800">Vendor Portal</h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/vendor/orders"
              className="relative p-2 rounded-xl bg-white/70 border border-slate-200/70 text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
              aria-label="Orders notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/"
              target="_blank"
              className="p-2 rounded-xl bg-white/70 border border-slate-200/70 text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
              title="Visit Store"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Routed Page Content */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
