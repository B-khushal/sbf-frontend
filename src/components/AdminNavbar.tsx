import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Trash2, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Maximize2, 
  Minimize2,
  Volume2,
  VolumeX,
  Search,
  User,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { getNotifications } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/dashboard/SearchInput';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export const AdminNavbar: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearReadNotifications,
    isConnected,
    syncNotifications,
    lastSyncTime,
    isSoundEnabled,
    toggleSound,
  } = useNotification();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        await getNotifications();
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncNotifications();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/admin/products/all?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="sbf-neumo-raised-sm sticky top-0 z-nav bg-[var(--sbf-card)]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 px-3 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Global Inset Search Bar (Inspired by reference design) */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit}>
            <SearchInput
              value={searchValue}
              onChangeValue={setSearchValue}
              placeholder="Search products, orders, customers (Press Enter)..."
              shortcutHint="↵"
              containerClassName="h-9 w-full bg-[var(--sbf-canvas)]"
            />
          </form>
        </div>

        {/* Mobile branding fallback spacer */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            SBF Studio
          </span>
        </div>

        {/* Right: Neumorphic Action Controls & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Connectivity Pill Badge */}
          <div className="hidden lg:flex items-center">
            {isConnected ? (
              <span className="sbf-neumo-pill px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Store Live</span>
              </span>
            ) : (
              <span className="sbf-neumo-pill px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1.5">
                <WifiOff className="w-3 h-3" />
                <span>Offline Sync</span>
              </span>
            )}
          </div>

          {/* Sound Toggle Button */}
          {toggleSound && (
            <button
              type="button"
              onClick={toggleSound}
              className="sbf-neumo-btn w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title={isSoundEnabled ? "Sound Alert On" : "Sound Alert Muted"}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-rose-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex sbf-neumo-btn w-9 h-9 rounded-xl items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Manual Refresh / Sync Button */}
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="sbf-neumo-btn h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Synchronize real-time orders & catalog data"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-rose-500", isSyncing && "animate-spin")} />
            <span className="hidden sm:inline font-semibold">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Notification Bell Dropdown */}
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="sbf-neumo-btn relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                {unreadCount > 0 ? (
                  <BellRing className="w-4 h-4 text-rose-600 animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-black text-white flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="sbf-neumo-raised w-[calc(100vw-1.5rem)] sm:w-88 max-w-sm p-0 rounded-2xl bg-[var(--sbf-card)] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden z-dropdown"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-rose-600" />
                    Notifications
                  </h4>
                  {lastSyncTime && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Synced {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={async () => await markAllAsRead()}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200/50"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.some((n) => n.isRead) && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (clearReadNotifications) {
                          await clearReadNotifications();
                        }
                      }}
                      className="text-[10px] text-slate-400 hover:text-rose-600 px-1 py-0.5"
                    >
                      Clear read
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium space-y-1">
                    <p className="text-base">🌸</p>
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={async () => !notification.isRead && await markAsRead(notification.id)}
                      className={cn(
                        'p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40',
                        !notification.isRead && 'bg-rose-50/40 dark:bg-rose-950/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                            {notification.message}
                          </p>
                          <span className="text-[9px] text-slate-400 block pt-0.5">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 shrink-0"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Capsule (Neumorphic raised capsule like reference image) */}
          {user && (
            <div className="sbf-neumo-raised-sm flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/40 select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-none line-clamp-1">
                  {user.name}
                </p>
                <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 capitalize leading-tight mt-0.5">
                  {user.role ? user.role.replace(/_/g, ' ') : 'Admin'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
