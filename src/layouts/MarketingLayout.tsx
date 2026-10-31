import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  Users,
  Radio,
  GitFork,
  Filter,
  Package,
  Search,
  ShoppingCart,
  Megaphone,
  UserCheck,
  Split,
  Calendar,
  Repeat,
  Activity,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  headOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/marketing', icon: LayoutDashboard },
  { name: 'Customer Intelligence', href: '/marketing/customers', icon: Users },
  { name: 'Live Visitors', href: '/marketing/live-visitors', icon: Radio, badge: 'Live' },
  { name: 'Customer Journeys', href: '/marketing/journeys', icon: GitFork },
  { name: 'Conversion Funnel', href: '/marketing/funnel', icon: Filter },
  { name: 'Product Analytics', href: '/marketing/products', icon: Package },
  { name: 'Search Intelligence', href: '/marketing/search', icon: Search },
  { name: 'Cart Intelligence', href: '/marketing/cart-intelligence', icon: ShoppingCart },
  { name: 'Campaign Analytics', href: '/marketing/campaigns', icon: Megaphone },
  { name: 'Audience Segments', href: '/marketing/segments', icon: UserCheck },
  { name: 'Attribution', href: '/marketing/attribution', icon: Split },
  { name: 'Cohort Analysis', href: '/marketing/cohorts', icon: Calendar },
  { name: 'Retention', href: '/marketing/retention', icon: Repeat },
  { name: 'Marketing Events', href: '/marketing/events', icon: Activity },
  { name: 'Reports', href: '/marketing/reports', icon: FileSpreadsheet, headOnly: true },
  { name: 'Settings', href: '/marketing/settings', icon: Settings, headOnly: true },
];

export const MarketingLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('mkt_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [liveCount, setLiveCount] = useState<number>(0);

  const isHead = user?.role === 'marketing_head' || user?.role === 'platform_admin' || user?.role === 'admin';

  // Periodic poll for live visitors indicator
  useEffect(() => {
    let isMounted = true;
    const fetchLiveCount = async () => {
      try {
        const data = await marketingService.getLiveVisitors();
        if (isMounted && data?.activeCount !== undefined) {
          setLiveCount(data.activeCount);
        }
      } catch (e) {
        // Silent fallback
      }
    };

    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('mkt_sidebar_collapsed', String(next));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderNavList = (onItemClick?: () => void, isCollapsedView: boolean = false) => {
    return (
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/marketing' && location.pathname.startsWith(item.href));
          const isRestricted = item.headOnly && !isHead;
          if (isRestricted) return null;

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 select-none relative",
                isActive
                  ? "sbf-nav-active"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
                isCollapsedView && "justify-center px-2 py-3"
              )}
              title={isCollapsedView ? item.name : undefined}
            >
              <div className={cn(
                "w-5 h-5 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-rose-600 dark:text-rose-400" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
              )}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              
              {!isCollapsedView && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {!isCollapsedView && item.badge && (
                <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="sbf-dashboard-shell min-h-screen flex selection:bg-rose-500/20 selection:text-rose-700 overflow-x-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-sheet bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Off-Canvas Drawer */}
      <aside
        className={cn(
          "sbf-neumo-raised fixed inset-y-0 left-0 z-sheet flex w-[85vw] max-w-xs flex-col bg-[var(--sbf-card)] p-4 transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
          <Link to="/marketing" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3">
            <div className="sbf-neumo-raised-sm w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/50 text-rose-600 shrink-0">
              <Sparkles className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white block font-sans">
                SBF Marketing
              </span>
              <span className="text-[10px] font-bold text-rose-600 tracking-widest block">
                INTELLIGENCE HQ
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="sbf-neumo-btn w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Visitor Pill */}
        <div className="my-3">
          <Link
            to="/marketing/live-visitors"
            onClick={() => setIsMobileOpen(false)}
            className="sbf-neumo-raised-sm flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Live Active Now</span>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              {liveCount}
            </span>
          </Link>
        </div>

        {renderNavList(() => setIsMobileOpen(false), false)}

        {/* User Footer */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/40 mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="sbf-neumo-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar (lg and up) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 bg-[var(--sbf-card)] border-r border-slate-200/50 dark:border-slate-800/40 shadow-[var(--sbf-shadow-raised)] z-30 select-none shrink-0",
          collapsed ? "w-20 p-2.5" : "w-64 lg:w-72 p-4"
        )}
      >
        {/* Brand Header */}
        <div className={cn("pt-2 pb-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <Link to="/marketing" className="flex items-center gap-3 group">
            <div className="sbf-neumo-raised-sm w-12 h-12 rounded-2xl p-2 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/50 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-rose-500" />
            </div>
            {!collapsed && (
              <div className="text-left">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block font-sans">
                  SBF Marketing
                </span>
                <span className="text-[10px] font-bold text-rose-600 tracking-widest block">
                  INTELLIGENCE
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="sbf-neumo-btn w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="sbf-neumo-btn w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Visitor Status Banner */}
        <div className="my-2">
          <Link
            to="/marketing/live-visitors"
            className={cn(
              "sbf-neumo-raised-sm flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40",
              collapsed ? "justify-center px-1" : "justify-between"
            )}
            title="Real-time Active Visitors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              {!collapsed && (
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Live Active</span>
              )}
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              {liveCount}
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        {renderNavList(undefined, collapsed)}

        {/* User Profile & Actions Footer */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/40 mt-auto">
          {!collapsed && user && (
            <div className="mb-2 p-2.5 rounded-2xl sbf-neumo-inset-sm flex items-center gap-2.5 bg-[var(--sbf-canvas)] border border-slate-200/40 dark:border-slate-800/40">
              <div className="sbf-neumo-raised-sm w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-extrabold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MK'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Marketing Executive'}
                </p>
                <p className="text-[10px] font-semibold text-rose-600 capitalize truncate">
                  {user?.role?.replace('_', ' ') || 'Marketing Team'}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "sbf-neumo-btn w-full flex items-center gap-2.5 py-2.5 px-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50/80 transition-all cursor-pointer",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[var(--sbf-canvas)] overflow-hidden">
        {/* Top Header */}
        <header className="sbf-neumo-raised-sm sticky top-0 z-nav bg-[var(--sbf-card)]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden sbf-neumo-btn w-9 h-9 rounded-xl flex items-center justify-center text-slate-700"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-sans truncate">
                <span>Marketing Intelligence</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                  SBF HQ
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Session Counter */}
            <Link
              to="/marketing/live-visitors"
              className="sbf-neumo-raised-sm flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50/80 border border-emerald-200/60"
              title="Real-time Active Visitors"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
              <span className="font-mono font-extrabold">{liveCount}</span>
              <span className="hidden md:inline text-[11px] font-semibold text-emerald-700">Live</span>
            </Link>

            {/* Abandoned Carts Quick Access */}
            <Link
              to="/marketing/cart-intelligence"
              className="sbf-neumo-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-600"
              title="Cart Intelligence"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Carts</span>
            </Link>

            {/* Storefront Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="sbf-neumo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Panel Main Content with soft neumorphic canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MarketingLayout;
