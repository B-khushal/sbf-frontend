import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Users, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Gift, 
  Store, 
  Calendar, 
  Activity, 
  Heart, 
  Flower2, 
  Sprout, 
  Cake, 
  Boxes, 
  FolderTree, 
  Layers, 
  LayoutDashboard, 
  Search,
  Truck, 
  Map, 
  DollarSign, 
  Sliders, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Clock, 
  Megaphone, 
  Percent, 
  BellRing, 
  HelpCircle,
  Sparkles,
  ClipboardList,
  ArrowUpDown,
  CheckSquare,
  Star,
  Settings2,
  CalendarDays,
  ShoppingBasket,
  Cookie,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import AdminNavbar from '@/components/AdminNavbar';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logout, user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isKitchenModeActive, setIsKitchenModeActive] = useState(false);

  // Sub-route active tracking
  const isDeliveryActive = location.pathname.startsWith('/admin/delivery-') || 
                           location.pathname === '/admin/partner-earnings' ||
                           location.pathname === '/admin/active-deliveries' ||
                           location.pathname === '/admin/assignment-rules' ||
                           location.pathname === '/admin/delivery-zones' ||
                           location.pathname === '/admin/delivery-settings' ||
                           location.pathname === '/admin/delivery-analytics';

  const allowedAdminRoles = ['platform_admin', 'store_owner', 'store_manager', 'delivery_manager', 'support_staff', 'inventory_staff', 'finance_staff', 'admin'];
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(isDeliveryActive);

  const hasPermission = (permission: string) => {
    if (user?.role === 'platform_admin' || user?.role === 'admin') return true;
    return user?.permissions?.includes(permission) || false;
  };

  const isStaffActive = location.pathname.startsWith('/admin/staff');
  const [isStaffOpen, setIsStaffOpen] = useState(isStaffActive);

  const isMarketingActive = location.pathname.startsWith('/admin/seasonal-campaigns') ||
                            location.pathname === '/admin/promocodes' ||
                            location.pathname === '/admin/offers' ||
                            location.pathname.startsWith('/admin/valentine') ||
                            location.pathname === '/admin/holidays' ||
                            location.pathname.startsWith('/admin/notifications') ||
                            location.pathname === '/admin/fcm-notifications';
  const [isMarketingOpen, setIsMarketingOpen] = useState(isMarketingActive);

  const isAnalyticsActive = location.pathname === '/admin/analytics' ||
                            location.pathname === '/admin/search-analytics';
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(isAnalyticsActive);

  const isProductsActive = location.pathname.startsWith('/admin/products') ||
                           location.pathname === '/admin/product-approval';
  const [isProductsOpen, setIsProductsOpen] = useState(isProductsActive);

  const isOrdersActive = location.pathname.startsWith('/admin/orders');
  const [isOrdersOpen, setIsOrdersOpen] = useState(isOrdersActive);

  useEffect(() => {
    if (isOrdersActive) setIsOrdersOpen(true);
  }, [location.pathname, isOrdersActive]);

  useEffect(() => {
    if (isProductsActive) setIsProductsOpen(true);
  }, [location.pathname, isProductsActive]);

  useEffect(() => {
    if (isDeliveryActive) setIsDeliveryOpen(true);
  }, [location.pathname, isDeliveryActive]);

  useEffect(() => {
    if (isStaffActive) setIsStaffOpen(true);
  }, [location.pathname, isStaffActive]);

  useEffect(() => {
    if (isMarketingActive) setIsMarketingOpen(true);
  }, [location.pathname, isMarketingActive]);

  useEffect(() => {
    if (isAnalyticsActive) setIsAnalyticsOpen(true);
  }, [location.pathname, isAnalyticsActive]);
  
  // Auth check
  useEffect(() => {
    if (!isLoading && (!user || !allowedAdminRoles.includes(user.role))) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
      });
      navigate('/login');
    }
  }, [user, isLoading, navigate, toast]);

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Keyboard shortcut Ctrl/Cmd + B
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const syncKitchenModeState = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      const hasBodyClass = document.body.classList.contains('kitchen-mode-active');
      setIsKitchenModeActive(isFullscreen || hasBodyClass);
    };

    const handleKitchenModeToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ active?: boolean }>;
      if (typeof customEvent.detail?.active === 'boolean') {
        setIsKitchenModeActive(customEvent.detail.active);
      } else {
        syncKitchenModeState();
      }
    };

    syncKitchenModeState();
    document.addEventListener('fullscreenchange', syncKitchenModeState);
    window.addEventListener('kitchen-mode-toggle', handleKitchenModeToggle as EventListener);

    return () => {
      document.removeEventListener('fullscreenchange', syncKitchenModeState);
      window.removeEventListener('kitchen-mode-toggle', handleKitchenModeToggle as EventListener);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="sbf-dashboard-shell min-h-screen flex items-center justify-center">
        <div className="sbf-neumo-raised p-8 rounded-3xl text-center space-y-4 max-w-xs">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }
  
  if (!user || !allowedAdminRoles.includes(user.role)) {
    return null;
  }

  const isTodayOrdersRoute = location.pathname === '/admin/orders/today';
  if (isTodayOrdersRoute && isKitchenModeActive) {
    return <Outlet />;
  }
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  const NavItem = ({
    to,
    icon: Icon,
    label,
    active,
    collapsed = false,
    badge,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    collapsed?: boolean;
    badge?: React.ReactNode;
  }) => (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        'group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 select-none text-xs font-semibold',
        active
          ? 'sbf-nav-active'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40',
        collapsed && 'justify-center px-2 py-3'
      )}
    >
      <div className={cn(
        "w-5 h-5 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
        active ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
      )}>
        <Icon className="w-4 h-4 stroke-[2.2]" />
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge && <span className="ml-auto shrink-0">{badge}</span>}
    </Link>
  );

  const SidebarContent = ({ isCollapsed = false }) => (
    <div className="flex flex-col h-full">
      {/* 1. SBF Brand Identity Card (Inspired by reference logo placement) */}
      <div className={cn("pt-4 pb-5 px-3 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="sbf-neumo-raised-sm w-12 h-12 rounded-2xl p-1.5 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="https://res.cloudinary.com/djtrhfqan/image/upload/v1791793251/logo_f_without_bg_mdrtys.png"
              alt="Spring Blossoms Florist"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block font-sans">
                Spring Blossoms
              </span>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-widest block">
                FLORIST HQ
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. Elevated User Capsule (Inspired by Sweetie Mehtaa's profile in reference image) */}
      {!isCollapsed && user && (
        <div className="mx-2 mb-5 p-3 rounded-2xl sbf-neumo-inset-sm flex items-center gap-3 bg-[var(--sbf-canvas)] border border-slate-200/40 dark:border-slate-800/40">
          <div className="sbf-neumo-raised-sm w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-extrabold text-sm shrink-0 border border-white/60">
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 capitalize truncate">
              {user.role ? user.role.replace(/_/g, ' ') : 'Administrator'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Navigation Links List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 pb-4 scrollbar-thin">
        {/* Dashboard Home */}
        <NavItem
          to="/admin"
          icon={LayoutDashboard}
          label="Dashboard"
          active={location.pathname === "/admin"}
          collapsed={isCollapsed}
        />

        {/* Orders Collapsible Group */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                setIsSidebarCollapsed(false);
                setIsOrdersOpen(true);
              } else {
                setIsOrdersOpen(prev => !prev);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs font-semibold select-none",
              isOrdersActive
                ? "text-rose-600 dark:text-rose-400 font-bold bg-rose-50/60 dark:bg-rose-950/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
              isCollapsed && "justify-center px-2 py-3"
            )}
            title={isCollapsed ? "Orders" : undefined}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              {!isCollapsed && <span>Orders</span>}
            </div>
            {!isCollapsed && (
              isOrdersOpen ? (
                <ChevronUp className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              )
            )}
          </button>

          {isOrdersOpen && !isCollapsed && (
            <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-rose-400/40 ml-4.5 text-xs">
              <Link
                to="/admin/orders"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/orders"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <span>All Orders</span>
              </Link>
              <Link
                to="/admin/orders/today"
                className={cn(
                  "flex items-center justify-between py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/orders/today"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Today's Orders</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.2 rounded-md shadow-2xs">
                  LIVE
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Products & Catalog Collapsible Group */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                setIsSidebarCollapsed(false);
                setIsProductsOpen(true);
              } else {
                setIsProductsOpen(prev => !prev);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs font-semibold select-none",
              isProductsActive
                ? "text-rose-600 dark:text-rose-400 font-bold bg-rose-50/60 dark:bg-rose-950/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
              isCollapsed && "justify-center px-2 py-3"
            )}
            title={isCollapsed ? "Catalog Products" : undefined}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4 stroke-[2.2]" />
              {!isCollapsed && <span>Products Catalog</span>}
            </div>
            {!isCollapsed && (
              isProductsOpen ? (
                <ChevronUp className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              )
            )}
          </button>

          {isProductsOpen && !isCollapsed && (
            <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-rose-400/40 ml-4.5 text-xs">
              <Link
                to="/admin/products/overview"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products" || location.pathname === "/admin/products/overview"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <span>Overview</span>
              </Link>
              <Link
                to="/admin/products/all"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/all"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <span>All Products</span>
              </Link>
              <Link
                to="/admin/products/bouquets"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/bouquets"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Flower2 className="w-3.5 h-3.5 text-pink-500" />
                <span>Bouquets</span>
              </Link>
              <Link
                to="/admin/products/cakes"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/cakes"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Cake className="w-3.5 h-3.5 text-amber-500" />
                <span>Cakes</span>
              </Link>
              <Link
                to="/admin/products/plants"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/plants"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                <span>Plants</span>
              </Link>
              <Link
                to="/admin/products/chocolates"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/chocolates"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Cookie className="w-3.5 h-3.5 text-amber-700" />
                <span>Chocolates</span>
              </Link>
              <Link
                to="/admin/products/combos"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/combos"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Gift className="w-3.5 h-3.5 text-rose-500" />
                <span>Combos</span>
              </Link>
              <Link
                to="/admin/products/hampers"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/hampers"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <ShoppingBasket className="w-3.5 h-3.5 text-purple-500" />
                <span>Hampers Builder</span>
              </Link>
              <Link
                to="/admin/products/addons"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/addons"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Add-ons</span>
              </Link>
              <Link
                to="/admin/products/collections"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/collections"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-500" />
                <span>Collections</span>
              </Link>
              <Link
                to="/admin/products/inventory"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/inventory"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <ClipboardList className="w-3.5 h-3.5 text-teal-500" />
                <span>Inventory Log</span>
              </Link>
              <Link
                to="/admin/products/order-arrangement"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/order-arrangement"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
                <span>Order Arrangement</span>
              </Link>
              <Link
                to="/admin/product-approval"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/product-approval"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Vendor Approvals</span>
              </Link>
              <Link
                to="/admin/products/reviews"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/reviews" || location.pathname === "/admin/reviews"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Reviews & Ratings</span>
              </Link>
              <Link
                to="/admin/products/settings"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/products/settings"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Catalog Settings</span>
              </Link>
            </div>
          )}
        </div>

        {/* Categories & Taxonomy */}
        <NavItem
          to="/admin/categories"
          icon={FolderTree}
          label="Categories"
          active={location.pathname === "/admin/categories"}
          collapsed={isCollapsed}
        />

        {/* Occasions */}
        <NavItem
          to="/admin/occasions"
          icon={Calendar}
          label="Occasions"
          active={location.pathname.startsWith("/admin/occasions")}
          collapsed={isCollapsed}
        />

        {/* Customers / Users */}
        <NavItem
          to="/admin/users"
          icon={Users}
          label="Customers"
          active={location.pathname.startsWith("/admin/users")}
          collapsed={isCollapsed}
        />

        {/* Vendors */}
        <NavItem
          to="/admin/vendors"
          icon={Store}
          label="Vendors"
          active={location.pathname.startsWith("/admin/vendors")}
          collapsed={isCollapsed}
        />

        {/* Reports & Analytics Collapsible Group */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                setIsSidebarCollapsed(false);
                setIsAnalyticsOpen(true);
              } else {
                setIsAnalyticsOpen(prev => !prev);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs font-semibold select-none",
              isAnalyticsActive
                ? "text-rose-600 dark:text-rose-400 font-bold bg-rose-50/60 dark:bg-rose-950/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
              isCollapsed && "justify-center px-2 py-3"
            )}
            title={isCollapsed ? "Analytics & Reports" : undefined}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              {!isCollapsed && <span>Analytics & Reports</span>}
            </div>
            {!isCollapsed && (
              isAnalyticsOpen ? (
                <ChevronUp className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              )
            )}
          </button>

          {isAnalyticsOpen && !isCollapsed && (
            <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-rose-400/40 ml-4.5 text-xs">
              <Link
                to="/admin/analytics"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/analytics" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <span>Sales & Revenue</span>
              </Link>
              <Link
                to="/admin/search-analytics"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/search-analytics" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Search className="w-3.5 h-3.5 text-blue-500" />
                <span>Search Trends</span>
              </Link>
              <Link
                to="/admin/delivery-analytics"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/delivery-analytics" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Delivery SLA</span>
              </Link>
              <Link
                to="/admin/valentine/analytics"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/valentine/analytics" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Valentine Trends</span>
              </Link>
            </div>
          )}
        </div>

        {/* Marketing Campaigns */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                setIsSidebarCollapsed(false);
                setIsMarketingOpen(true);
              } else {
                setIsMarketingOpen(prev => !prev);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs font-semibold select-none",
              isMarketingActive
                ? "text-rose-600 dark:text-rose-400 font-bold bg-rose-50/60 dark:bg-rose-950/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
              isCollapsed && "justify-center px-2 py-3"
            )}
            title={isCollapsed ? "Marketing" : undefined}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-4 h-4 stroke-[2.2]" />
              {!isCollapsed && <span>Marketing & Offers</span>}
            </div>
            {!isCollapsed && (
              isMarketingOpen ? (
                <ChevronUp className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              )
            )}
          </button>

          {isMarketingOpen && !isCollapsed && (
            <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-rose-400/40 ml-4.5 text-xs">
              <Link
                to="/admin/seasonal-campaigns"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname.startsWith("/admin/seasonal-campaigns")
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <span>Campaigns</span>
              </Link>
              <Link
                to="/admin/promocodes"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/promocodes"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <span>Promo Codes</span>
              </Link>
              <Link
                to="/admin/offers"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/offers"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <span>Special Offers</span>
              </Link>
              <Link
                to="/admin/valentine"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/valentine"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Valentine's Hub</span>
              </Link>
              <Link
                to="/admin/holidays"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/holidays"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
                <span>Holiday Dates</span>
              </Link>
              <Link
                to="/admin/notifications/fcm"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname.startsWith("/admin/notifications") || location.pathname === "/admin/fcm-notifications"
                    ? "sbf-nav-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <BellRing className="w-3.5 h-3.5 text-indigo-500" />
                <span>Push Notifications</span>
              </Link>
            </div>
          )}
        </div>

        {/* Delivery Logistics */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                setIsSidebarCollapsed(false);
                setIsDeliveryOpen(true);
              } else {
                setIsDeliveryOpen(prev => !prev);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs font-semibold select-none",
              isDeliveryActive
                ? "text-rose-600 dark:text-rose-400 font-bold bg-rose-50/60 dark:bg-rose-950/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
              isCollapsed && "justify-center px-2 py-3"
            )}
            title={isCollapsed ? "Delivery" : undefined}
          >
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 stroke-[2.2]" />
              {!isCollapsed && <span>Delivery Fleet</span>}
            </div>
            {!isCollapsed && (
              isDeliveryOpen ? (
                <ChevronUp className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              )
            )}
          </button>

          {isDeliveryOpen && !isCollapsed && (
            <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-rose-400/40 ml-4.5 text-xs">
              <Link
                to="/admin/delivery-partners"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/delivery-partners" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                <span>Riders & Partners</span>
              </Link>
              <Link
                to="/admin/active-deliveries"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/active-deliveries" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Truck className="w-3.5 h-3.5 mr-1" />
                <span>Live Dispatches</span>
              </Link>
              <Link
                to="/admin/delivery-zones"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/delivery-zones" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Map className="w-3.5 h-3.5 mr-1" />
                <span>Hyderabad Zones</span>
              </Link>
              <Link
                to="/admin/partner-earnings"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/partner-earnings" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                <span>Partner Earnings</span>
              </Link>
              <Link
                to="/admin/assignment-rules"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/assignment-rules" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Sliders className="w-3.5 h-3.5 mr-1 text-blue-500" />
                <span>Assignment Rules</span>
              </Link>
              <Link
                to="/admin/delivery-settings"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                  location.pathname === "/admin/delivery-settings" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                <span>Delivery Slots & Rules</span>
              </Link>
            </div>
          )}
        </div>

        {/* Staff Management Collapsible Group (if permitted) */}
        {hasPermission('staff:view') && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsStaffOpen(true);
                } else {
                  setIsStaffOpen(prev => !prev);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs font-semibold select-none",
                isStaffActive
                  ? "text-rose-600 dark:text-rose-400 font-bold bg-rose-50/60 dark:bg-rose-950/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40",
                isCollapsed && "justify-center px-2 py-3"
              )}
              title={isCollapsed ? "Staff & Roles" : undefined}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 stroke-[2.2]" />
                {!isCollapsed && <span>Staff & Roles</span>}
              </div>
              {!isCollapsed && (
                isStaffOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                )
              )}
            </button>

            {isStaffOpen && !isCollapsed && (
              <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-rose-400/40 ml-4.5 text-xs">
                <Link
                  to="/admin/staff"
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                    location.pathname === "/admin/staff" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Staff Directory</span>
                </Link>
                <Link
                  to="/admin/staff/roles"
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                    location.pathname === "/admin/staff/roles" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Roles & Permissions</span>
                </Link>
                <Link
                  to="/admin/staff/attendance"
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                    location.pathname === "/admin/staff/attendance" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Attendance & Shifts</span>
                </Link>
                <Link
                  to="/admin/staff/sessions"
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold",
                    location.pathname === "/admin/staff/sessions" ? "sbf-nav-active" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Login Sessions</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Activity Logs */}
        <NavItem
          to="/admin/activity-logs"
          icon={Activity}
          label="Activity Logs"
          active={location.pathname === "/admin/activity-logs"}
          collapsed={isCollapsed}
        />

        {/* FAQ System */}
        <NavItem
          to="/admin/faqs"
          icon={HelpCircle}
          label="FAQ System"
          active={location.pathname === "/admin/faqs"}
          collapsed={isCollapsed}
        />

        {/* Settings */}
        <NavItem
          to="/admin/settings"
          icon={Settings}
          label="Settings"
          active={location.pathname === "/admin/settings"}
          collapsed={isCollapsed}
        />
      </nav>

      {/* 4. Bottom Logout Button */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/50 mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "sbf-neumo-btn w-full flex items-center gap-2.5 py-2.5 px-3 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition-all cursor-pointer",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 stroke-[2.2] shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="sbf-dashboard-shell">
      <div className="flex min-h-screen">
        {/* Mobile Backdrop Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-sheet bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 md:hidden",
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Mobile Drawer Sidebar */}
        <aside
          id="admin-mobile-sidebar"
          className={cn(
            "sbf-neumo-raised fixed inset-y-0 left-0 z-sheet w-[85vw] max-w-xs bg-[var(--sbf-card)] p-4 transition-transform duration-300 md:hidden",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent isCollapsed={false} />
        </aside>

        {/* Desktop Neumorphic Sidebar */}
        <aside
          className={cn(
            "admin-desktop-sidebar hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 bg-[var(--sbf-card)] border-r border-slate-200/50 dark:border-slate-800/40 shadow-[var(--sbf-shadow-raised)] z-30 select-none",
            isSidebarCollapsed ? "w-20 p-2.5" : "w-64 lg:w-72 p-4"
          )}
        >
          {/* Sidebar Collapse Toggle Icon */}
          <div className={cn("flex pb-1", isCollapsed => isSidebarCollapsed ? "justify-center" : "justify-end")}>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="sbf-neumo-btn w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600 dark:text-slate-400 transition-colors"
              title={`${isSidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar (Ctrl+B)`}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <SidebarContent isCollapsed={isSidebarCollapsed} />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="dashboard-main flex-1 flex flex-col min-h-screen min-w-0 bg-[var(--sbf-canvas)]">
          {/* Mobile Top Header */}
          <div className="admin-mobile-topbar md:hidden flex items-center justify-between px-4 py-3 bg-[var(--sbf-card)] border-b border-slate-200/60 dark:border-slate-800/50 sticky top-0 z-nav shadow-xs">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="sbf-neumo-btn w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 font-sans">
                Spring Blossoms
              </span>
            </div>
            <div className="w-9" />
          </div>

          {/* Desktop Top Navbar Shell */}
          <div className="admin-navbar-shell">
            <AdminNavbar />
          </div>

          {/* Panel Outlet Container with generous soft neumorphic padding */}
          <main className="panel-content flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
