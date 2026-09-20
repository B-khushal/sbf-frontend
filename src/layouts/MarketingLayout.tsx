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
  RefreshCw,
  BellRing,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { marketingService } from '@/services/marketingService';
import { cn } from '@/lib/utils';

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
    const interval = setInterval(fetchLiveCount, 15000); // every 15s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-gradient-to-r from-rose-600/20 to-pink-600/10 text-rose-300 border border-rose-500/30 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
              title={isCollapsedView ? item.name : undefined}
            >
              <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-rose-400" : "text-slate-400 group-hover:text-slate-200")} />
              
              {!isCollapsedView && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {!isCollapsedView && item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-rose-500 rounded-r-full shadow-sm shadow-rose-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/30 selection:text-rose-200 overflow-x-hidden">
      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Off-Canvas Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col bg-slate-900 border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <Link
            to="/marketing"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-wide text-slate-100 uppercase">
                SBF Marketing
              </span>
              <span className="text-[10px] font-medium text-rose-400">
                Intelligence Suite
              </span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Live Visitor Pill in Mobile Drawer */}
        <div className="px-3 py-2 border-b border-slate-800/50 bg-slate-950/40 shrink-0">
          <Link
            to="/marketing/live-visitors"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30 hover:border-emerald-700/50 transition-all"
            title="Real-time Active Visitors"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400">Live Active Now</span>
            </div>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              {liveCount}
            </span>
          </Link>
        </div>

        {/* Mobile Navigation Links */}
        {renderNavList(() => setIsMobileOpen(false), false)}

        {/* Mobile User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-rose-300 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MK'}
            </div>

            <div className="flex flex-col truncate flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'Marketing Executive'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-rose-400 inline" />
                {user?.role?.replace('_', ' ') || 'Marketing Team'}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-rose-300 transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-400 font-mono text-[10px]">sbflorist.in</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (lg and up) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl transition-all duration-300 z-40 shrink-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <Link to="/marketing" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-wide text-slate-100 uppercase">
                  SBF Marketing
                </span>
                <span className="text-[11px] font-medium text-rose-400">
                  Intelligence Suite
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Live Visitor Status Banner */}
        <div className="px-3 py-2 border-b border-slate-800/50 bg-slate-950/40 shrink-0">
          <Link
            to="/marketing/live-visitors"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30 hover:border-emerald-700/50 transition-all",
              collapsed && "justify-center px-0"
            )}
            title="Real-time Active Visitors"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-emerald-400">Live Active</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {liveCount}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Desktop Navigation Items */}
        {renderNavList(undefined, collapsed)}

        {/* User Profile & Actions Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-slate-800/40", collapsed && "justify-center p-1")}>
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-rose-300 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MK'}
            </div>

            {!collapsed && (
              <div className="flex flex-col truncate flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'Marketing Executive'}
                </span>
                <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-rose-400 inline" />
                  {user?.role?.replace('_', ' ') || 'Marketing Team'}
                </span>
              </div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {!collapsed && (
            <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-rose-300 transition-colors"
              >
                <span>Storefront</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-400 font-mono text-[10px]">sbflorist.in</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Button for Mobile / Tablet */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden h-9 w-9 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl shrink-0"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2 truncate">
                <span>Marketing Intelligence</span>
                <span className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  sbflorist.in
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden xl:block truncate">
                Understand customer behavior. Identify intent. Improve conversion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Session Counter */}
            <Link
              to="/marketing/live-visitors"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 hover:border-emerald-700/60 text-xs text-emerald-300 transition-all shrink-0"
              title="Real-time Active Visitors"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono font-bold text-emerald-300">{liveCount}</span>
              <span className="hidden md:inline text-[11px] text-emerald-400 font-medium">Live</span>
            </Link>

            {/* Abandoned Carts Quick Access */}
            <Link
              to="/marketing/cart-intelligence"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-200 transition-all shrink-0"
              title="Cart Intelligence"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Carts</span>
            </Link>

            {/* Reports Export (Head only) */}
            {isHead && (
              <Link
                to="/marketing/reports"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold text-rose-300 transition-all shrink-0"
                title="Export Reports"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden md:inline">Reports</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MarketingLayout;

