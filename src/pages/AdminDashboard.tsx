import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Users, ShoppingBag, Package, Settings, LogOut, Menu, TrendingUp, ChevronLeft, ChevronRight, Tag, Gift, Store, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import AdminNavbar from '@/components/AdminNavbar';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Check if user is admin, if not redirect
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
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
  if (!user || user.role !== 'admin') {
    return null;
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
            src="/placeholder.svg"
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
            "fixed inset-y-0 left-0 z-sheet w-[85vw] max-w-xs bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 md:hidden",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col p-4 sidebar-scrollable">
            <SidebarContent isCollapsed={false} />
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex bg-white dark:bg-gray-800 h-screen sticky top-0 shadow-md flex-col transition-all duration-300 ${
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
          <div className="md:hidden flex items-center justify-between border-b bg-white dark:bg-gray-800 px-3 py-2.5 sticky top-0 z-nav">
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
            <div className="hidden md:flex items-center p-4 border-b bg-white dark:bg-gray-800">
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
          
          <AdminNavbar />
          <div className="panel-content overflow-x-hidden overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
