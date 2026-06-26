import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Users, ShoppingBag, Package, Settings, LogOut, Menu, TrendingUp, ChevronLeft, ChevronRight, Tag, Gift, Store, Calendar, CheckCircle, ClipboardList, Activity, MessageSquareText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import AdminNavbar from '@/components/AdminNavbar';
import { Truck, Map, DollarSign, Sliders, UserCheck, ChevronDown, ChevronUp, Scroll, Shield, Clock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logout, user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isKitchenModeActive, setIsKitchenModeActive] = useState(false);

  // Check if any sub-route of delivery is active to auto-expand the dropdown
  const isDeliveryActive = location.pathname.startsWith('/admin/delivery-') || 
                           location.pathname === '/admin/partner-earnings' ||
                           location.pathname === '/admin/active-deliveries' ||
                           location.pathname === '/admin/assignment-rules';

  const allowedAdminRoles = ['platform_admin', 'store_owner', 'store_manager', 'delivery_manager', 'support_staff', 'inventory_staff', 'finance_staff', 'admin'];
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(isDeliveryActive);

  const hasPermission = (permission: string) => {
    if (user?.role === 'platform_admin' || user?.role === 'admin') return true;
    return user?.permissions?.includes(permission) || false;
  };

  const isStaffActive = location.pathname.startsWith('/admin/staff') ||
                        location.pathname === '/admin/activity-logs' ||
                        location.pathname === '/admin/login-history';

  const [isStaffOpen, setIsStaffOpen] = useState(isStaffActive);

  // Keep dropdown open if the route matches
  useEffect(() => {
    if (isDeliveryActive) {
      setIsDeliveryOpen(true);
    }
  }, [location.pathname, isDeliveryActive]);

  useEffect(() => {
    if (isStaffActive) {
      setIsStaffOpen(true);
    }
  }, [location.pathname, isStaffActive]);
  
  // Check if user is admin, if not redirect
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

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Add keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
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
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // If no user or not admin after loading completes, don't render dashboard
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
  
  const SidebarContent = ({ isCollapsed = false }) => (
    <>
      <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : ''}`}>
        <Link to="/" className="flex items-center">
          <img
            src="https://res.cloudinary.com/djtrhfqan/image/upload/v1771960430/sbf-products/image-1771960425724-93003075.png"
            alt="Spring Blossoms Florist Logo"
            className={`transition-all duration-300 ease-in-out hover:scale-105 ${
              isCollapsed ? 'h-10 w-10' : 'h-16 w-auto max-w-full'
            }`}
          />
        </Link>
      </div>
      
      {!isCollapsed && (
        <div className="mb-6">
          {user && (
            <div className="px-2 py-3">
              <p className="text-sm font-medium">Logged in as:</p>
              <p className="text-base font-bold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
        </div>
      )}
      
      <nav className="flex-1 space-y-1">
        <Link 
          to="/admin" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Dashboard' : ''}
        >
          <div className="sidebar-item-icon">
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Dashboard</span>}
        </Link>
        <Link 
          to="/admin/products" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Products' : ''}
        >
          <div className="sidebar-item-icon">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Products</span>}
        </Link>
        <Link 
          to="/admin/categories" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Categories' : ''}
        >
          <div className="sidebar-item-icon">
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Categories</span>}
        </Link>
        <Link 
          to="/admin/addons" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Addon Products' : ''}
        >
          <div className="sidebar-item-icon">
            <Gift className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Addon Products</span>}
        </Link>
        <Link 
          to="/admin/product-approval" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Product Approval' : ''}
        >
          <div className="sidebar-item-icon">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Product Approval</span>}
        </Link>
        <Link 
          to="/admin/orders" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Orders' : ''}
        >
          <div className="sidebar-item-icon">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Orders</span>}
        </Link>
        <Link 
          to="/admin/reviews" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Reviews' : ''}
        >
          <div className="sidebar-item-icon">
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Reviews</span>}
        </Link>
        <Link 
          to="/admin/orders/today" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? "Today's Orders" : ''}
        >
          <div className="sidebar-item-icon">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Today's Orders</span>}
        </Link>
        <Link 
          to="/admin/users" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Users' : ''}
        >
          <div className="sidebar-item-icon">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Users</span>}
        </Link>
        <Link 
          to="/admin/activity-logs" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'User Activity Logs' : ''}
        >
          <div className="sidebar-item-icon">
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">User Activity Logs</span>}
        </Link>
        <Link 
          to="/admin/vendors" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Vendors' : ''}
        >
          <div className="sidebar-item-icon">
            <Store className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Vendors</span>}
        </Link>
        <Link 
          to="/admin/analytics" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Analytics' : ''}
        >
          <div className="sidebar-item-icon">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Analytics</span>}
        </Link>
        <Link 
          to="/admin/promocodes" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Promo Codes' : ''}
        >
          <div className="sidebar-item-icon">
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Promo Codes</span>}
        </Link>
        <Link 
          to="/admin/offers" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Offers' : ''}
        >
          <div className="sidebar-item-icon">
            <Gift className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Offers</span>}
        </Link>
        <Link 
          to="/admin/holidays" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Holidays' : ''}
        >
          <div className="sidebar-item-icon">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Holidays</span>}
        </Link>
        <Link 
          to="/admin/valentine" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? "Valentine's" : ''}
        >
          <div className="sidebar-item-icon">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Valentine's</span>}
        </Link>
        <Link 
          to="/admin/seasonal-campaigns" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? "Seasonal Campaigns" : ''}
        >
          <div className="sidebar-item-icon">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Seasonal Campaigns</span>}
        </Link>
        {/* Delivery Dropdown */}
        <div className="space-y-1">
          <button
            onClick={() => {
              if (isCollapsed) {
                setIsSidebarCollapsed(false);
                setIsDeliveryOpen(true);
              } else {
                setIsDeliveryOpen(prev => !prev);
              }
            }}
            className={cn(
              "w-full sidebar-item flex items-center justify-between transition-colors",
              isDeliveryActive ? "bg-accent/40 text-accent-foreground font-medium" : "",
              isCollapsed ? "sidebar-item-collapsed justify-center" : "sidebar-item-expanded"
            )}
            title={isCollapsed ? 'Delivery' : ''}
          >
            <div className="flex items-center">
              <div className="sidebar-item-icon">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              {!isCollapsed && <span className="sidebar-item-text ml-3">Delivery</span>}
            </div>
            {!isCollapsed && (
              isDeliveryOpen ? 
                <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" /> : 
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
            )}
          </button>
          
          {isDeliveryOpen && !isCollapsed && (
            <div className="pl-4 space-y-1 mt-1 border-l-2 border-primary/20 ml-5">
              <Link 
                to="/admin/delivery-partners" 
                className={cn(
                  "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                  location.pathname === "/admin/delivery-partners" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                <span className="sidebar-item-text">Delivery Partners</span>
              </Link>
              <Link 
                to="/admin/active-deliveries" 
                className={cn(
                  "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                  location.pathname === "/admin/active-deliveries" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Truck className="h-4 w-4 mr-2" />
                <span className="sidebar-item-text">Active Deliveries</span>
              </Link>
              <Link 
                to="/admin/delivery-analytics" 
                className={cn(
                  "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                  location.pathname === "/admin/delivery-analytics" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="sidebar-item-text">Delivery Analytics</span>
              </Link>
              <Link 
                to="/admin/partner-earnings" 
                className={cn(
                  "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                  location.pathname === "/admin/partner-earnings" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="sidebar-item-text">Partner Earnings</span>
              </Link>
              <Link 
                to="/admin/delivery-zones" 
                className={cn(
                  "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                  location.pathname === "/admin/delivery-zones" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Map className="h-4 w-4 mr-2" />
                <span className="sidebar-item-text">Delivery Zones</span>
              </Link>
              <Link 
                to="/admin/delivery-settings" 
                className={cn(
                  "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                  location.pathname === "/admin/delivery-settings" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Sliders className="h-4 w-4 mr-2" />
                <span className="sidebar-item-text">Delivery Settings</span>
              </Link>
              <Link 
                to="/admin/assignment-rules" 
                className={cn(
                  "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                  location.pathname === "/admin/assignment-rules" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Scroll className="h-4 w-4 mr-2" />
                <span className="sidebar-item-text">Assignment Rules</span>
              </Link>
            </div>
          )}
        </div>
        {/* Staff Management Dropdown */}
        {hasPermission('staff:view') && (
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsStaffOpen(true);
                } else {
                  setIsStaffOpen(prev => !prev);
                }
              }}
              className={cn(
                "w-full sidebar-item flex items-center justify-between transition-colors",
                isStaffActive ? "bg-accent/40 text-accent-foreground font-medium" : "",
                isCollapsed ? "sidebar-item-collapsed justify-center" : "sidebar-item-expanded"
              )}
              title={isCollapsed ? 'Staff Management' : ''}
            >
              <div className="flex items-center">
                <div className="sidebar-item-icon">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                {!isCollapsed && <span className="sidebar-item-text ml-3">Staff Management</span>}
              </div>
              {!isCollapsed && (
                isStaffOpen ? 
                  <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" /> : 
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
              )}
            </button>
            
            {isStaffOpen && !isCollapsed && (
              <div className="pl-4 space-y-1 mt-1 border-l-2 border-primary/20 ml-5">
                <Link 
                  to="/admin/staff" 
                  className={cn(
                    "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                    location.pathname === "/admin/staff" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="sidebar-item-text">Staff List</span>
                </Link>
                <Link 
                  to="/admin/staff/roles" 
                  className={cn(
                    "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                    location.pathname === "/admin/staff/roles" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="sidebar-item-text">Roles & Permissions</span>
                </Link>
                <Link 
                  to="/admin/staff/attendance" 
                  className={cn(
                    "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                    location.pathname === "/admin/staff/attendance" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="sidebar-item-text">Attendance</span>
                </Link>
                {hasPermission('settings:view') && (
                  <Link 
                    to="/admin/staff/logs" 
                    className={cn(
                      "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                      location.pathname === "/admin/staff/logs" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    <span className="sidebar-item-text">Activity Logs</span>
                  </Link>
                )}
                <Link 
                  to="/admin/staff/sessions" 
                  className={cn(
                    "sidebar-item flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                    location.pathname === "/admin/staff/sessions" ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  <span className="sidebar-item-text">Login Sessions</span>
                </Link>
              </div>
            )}
          </div>
        )}
        <Link 
          to="/admin/settings" 
          className={cn(
            "sidebar-item",
            isCollapsed ? "sidebar-item-collapsed" : "sidebar-item-expanded"
          )}
          title={isCollapsed ? 'Settings' : ''}
        >
          <div className="sidebar-item-icon">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Settings</span>}
        </Link>
      </nav>
      
      <div className="mt-auto">
        <Button 
          variant="outline" 
          className={cn(
            "w-full sidebar-item",
            isCollapsed ? "sidebar-item-collapsed px-2" : "sidebar-item-expanded justify-start"
          )}
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <div className="sidebar-item-icon">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && <span className="sidebar-item-text">Logout</span>}
        </Button>
      </div>
    </>
  );
  
  return (
    <div className="dashboard-shell">
      <div className="flex min-h-screen">
        <div className={cn(
          "fixed inset-0 z-sheet bg-black/50 transition-opacity duration-200 md:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )} onClick={() => setIsSidebarOpen(false)} />
        <aside
          id="admin-mobile-sidebar"
          className={cn(
            "admin-mobile-sidebar fixed inset-y-0 left-0 z-sheet w-[85vw] max-w-xs bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 md:hidden",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col p-4 sidebar-scrollable">
            <SidebarContent isCollapsed={false} />
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className={`admin-desktop-sidebar hidden md:flex bg-white dark:bg-gray-800 h-screen sticky top-0 shadow-md flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Sidebar Toggle Button */}
          <div className="flex justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8"
              title={`${isSidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar (Ctrl/Cmd + B)`}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className={`flex flex-col flex-1 sidebar-scrollable ${isSidebarCollapsed ? 'px-2 pb-4' : 'px-4 pb-4'}`}>
            <SidebarContent isCollapsed={isSidebarCollapsed} />
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="dashboard-main flex flex-col min-h-screen">
          <div className="admin-mobile-topbar md:hidden flex items-center justify-between border-b bg-white dark:bg-gray-800 px-3 py-2.5 sticky top-0 z-nav">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-expanded={isSidebarOpen}
              aria-controls="admin-mobile-sidebar"
              className="touch-action-btn"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold">Admin Panel</span>
            <span className="w-9" />
          </div>
          {/* Top bar with sidebar toggle for collapsed state */}
          {isSidebarCollapsed && (
            <div className="admin-collapsed-topbar hidden md:flex items-center p-4 border-b bg-white dark:bg-gray-800">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(false)}
                className="h-8 w-8"
                title="Expand Sidebar (Ctrl/Cmd + B)"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <span className="ml-2 text-sm text-muted-foreground">
                Press Ctrl/Cmd + B to toggle sidebar
              </span>
            </div>
          )}
          
          <div className="admin-navbar-shell">
            <AdminNavbar />
          </div>
          <div className="panel-content overflow-x-hidden overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
