import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from '@/components/ErrorBoundary';
import MainLayout from './components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import useCart from '@/hooks/use-cart';
import CartLoader from '@/components/CartLoader';
import PwaInstallManager from '@/components/PwaInstallManager';

// Core pages that should load immediately
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Lazy loaded pages with better organization
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const WishlistPage = lazy(() => import("./pages/wishlist"));

// Auth Pages (lazy loaded)
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));

// Legal Pages (lazy loaded)
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPrivacy"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const RefundPolicyPage = lazy(() => import("./pages/RefundPolicyPage"));
const CancellationPolicyPage = lazy(() => import("./pages/CancellationPolicyPage"));

// Checkout Pages (lazy loaded as they're rarely used immediately)
const CheckoutShippingPage = lazy(() => import("./pages/CheckoutShippingPage"));
const CheckoutPaymentPage = lazy(() => import("./pages/CheckoutPaymentPage"));
const CheckoutConfirmationPage = lazy(() => import("./pages/CheckoutConfirmationPage"));

// Admin Pages (heavily lazy loaded as they're admin-only)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminDashboardHome = lazy(() => import("./pages/Admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/Admin/Products"));
const AdminOrders = lazy(() => import("./pages/Admin/Orders"));
const AdminUsers = lazy(() => import("./pages/Admin/Users"));
const AdminVendorManagement = lazy(() => import("./pages/Admin/VendorManagement"));
const OrderDetailsPage = lazy(() => import("./pages/Admin/OrderDetailsPage"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage"));
const Analytics = lazy(() => import("./pages/Admin/Analytics"));
const PromoCodes = lazy(() => import("./pages/Admin/PromoCodes"));
const OffersManager = lazy(() => import("./pages/Admin/OffersManager"));
const HolidayManagement = lazy(() => import("./pages/Admin/HolidayManagement"));
const ProductForm = lazy(() => import('@/pages/Admin/ProductForm'));
const ProductApproval = lazy(() => import('@/pages/Admin/ProductApproval'));
const UserViewPage = lazy(() => import('./pages/Admin/UserViewPage'));
const UserEditPage = lazy(() => import('./pages/Admin/UserEditPage'));

// Vendor Pages (lazy loaded as they're vendor-only)
const VendorPage = lazy(() => import("./pages/VendorPage"));
const VendorDashboard = lazy(() => import("./pages/Vendor/VendorDashboard"));
const VendorRegistration = lazy(() => import("./pages/Vendor/VendorRegistration"));
const VendorLayout = lazy(() => import("./components/VendorLayout"));
const VendorProtectedRoute = lazy(() => import("./components/VendorProtectedRoute"));
const VendorProducts = lazy(() => import('./pages/Vendor/VendorProducts'));
const VendorOrders = lazy(() => import('./pages/Vendor/VendorOrders'));
const VendorAnalytics = lazy(() => import('./pages/Vendor/VendorAnalytics'));
const VendorPayouts = lazy(() => import('./pages/Vendor/VendorPayouts'));
const VendorSettings = lazy(() => import('./pages/Vendor/VendorSettings'));

// Optimize QueryClient for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Enhanced loading component
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

const App = () => {
  // Check for order data in sessionStorage and restore it
  useEffect(() => {
    try {
      // Check if we're on the confirmation page
      if (window.location.pathname === '/checkout/confirmation') {
        const backupOrder = sessionStorage.getItem('backup_order');

        if (backupOrder && !localStorage.getItem('lastOrder')) {
          localStorage.setItem('lastOrder', backupOrder);
        }
      }
    } catch (error) {
      console.error('App: Error checking for backup order data:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "246004709667-1a33cbkt2b2hq2m1foav1b3j4fsvilef.apps.googleusercontent.com"}
          onScriptLoadError={(error) => {
            console.warn('Google OAuth script failed to load:', error);
          }}
        >
          <AuthProvider>
            <CartLoader />
            <CurrencyProvider>
              <SettingsProvider>
                <NotificationProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <PwaInstallManager />
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          {/* Main Layout Routes */}
                          <Route element={<MainLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/shop" element={
                              <Suspense fallback={<LoadingFallback message="Loading shop..." />}>
                                <ShopPage />
                              </Suspense>
                            } />
                            <Route path="/shop/:category" element={
                              <Suspense fallback={<LoadingFallback message="Loading products..." />}>
                                <ShopPage />
                              </Suspense>
                            } />
                            <Route path="/product/:id" element={
                              <Suspense fallback={<LoadingFallback message="Loading product..." />}>
                                <ProductPage />
                              </Suspense>
                            } />
                            <Route path="/products/:productId" element={
                              <Suspense fallback={<LoadingFallback message="Loading product..." />}>
                                <ProductPage />
                              </Suspense>
                            } />
                            <Route path="/cart" element={
                              <Suspense fallback={<LoadingFallback message="Loading cart..." />}>
                                <CartPage />
                              </Suspense>
                            } />
                            <Route path="/about" element={
                              <Suspense fallback={<LoadingFallback message="Loading about..." />}>
                                <AboutPage />
                              </Suspense>
                            } />
                            <Route path="/wishlist" element={
                              <Suspense fallback={<LoadingFallback message="Loading wishlist..." />}>
                                <WishlistPage />
                              </Suspense>
                            } />
                            <Route path="/contact" element={
                              <Suspense fallback={<LoadingFallback message="Loading contact..." />}>
                                <ContactPage />
                              </Suspense>
                            } />
                          </Route>

                          {/* Legal Pages */}
                          <Route path="/terms" element={
                            <Suspense fallback={<LoadingFallback />}>
                              <TermsPage />
                            </Suspense>
                          } />
                          <Route path="/shipping" element={
                            <Suspense fallback={<LoadingFallback />}>
                              <ShippingPage />
                            </Suspense>
                          } />
                          <Route path="/privacy" element={
                            <Suspense fallback={<LoadingFallback />}>
                              <PrivacyPage />
                            </Suspense>
                          } />
                          <Route path="/refund-policy" element={
                            <Suspense fallback={<LoadingFallback />}>
                              <RefundPolicyPage />
                            </Suspense>
                          } />
                          <Route path="/cancellation-policy" element={
                            <Suspense fallback={<LoadingFallback />}>
                              <CancellationPolicyPage />
                            </Suspense>
                          } />
                          <Route path="/forgot-password" element={
                            <Suspense fallback={<LoadingFallback />}>
                              <ForgotPasswordPage />
                            </Suspense>
                          } />

                          {/* Checkout Routes */}
                          <Route path="/checkout/shipping" element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingFallback message="Loading checkout..." />}>
                                <CheckoutShippingPage />
                              </Suspense>
                            </ProtectedRoute>
                          } />
                          <Route path="/checkout/payment" element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingFallback message="Processing payment..." />}>
                                <CheckoutPaymentPage />
                              </Suspense>
                            </ProtectedRoute>
                          } />
                          <Route path="/checkout/confirmation" element={
                            <Suspense fallback={<LoadingFallback message="Loading confirmation..." />}>
                              <CheckoutConfirmationPage />
                            </Suspense>
                          } />

                          {/* Auth Routes */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/signup" element={<SignupPage />} />
                          <Route path="/profile" element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingFallback message="Loading profile..." />}>
                                <ProfilePage />
                              </Suspense>
                            </ProtectedRoute>
                          } />

                          {/* Admin Panel Routes - Protected and Lazy Loaded */}
                          <Route path="/admin" element={
                            <ProtectedRoute requiredRole="admin">
                              <Suspense fallback={<LoadingFallback message="Loading admin panel..." />}>
                                <AdminDashboard />
                              </Suspense>
                            </ProtectedRoute>
                          }>
                            <Route index element={
                              <Suspense fallback={<LoadingFallback message="Loading dashboard..." />}>
                                <AdminDashboardHome />
                              </Suspense>
                            } />
                            <Route path="products" element={
                              <Suspense fallback={<LoadingFallback message="Loading products..." />}>
                                <AdminProducts />
                              </Suspense>
                            } />
                            <Route path="products/new" element={
                              <Suspense fallback={<LoadingFallback message="Loading form..." />}>
                                <ProductForm />
                              </Suspense>
                            } />
                            <Route path="products/edit/:id" element={
                              <Suspense fallback={<LoadingFallback message="Loading form..." />}>
                                <ProductForm />
                              </Suspense>
                            } />
                            <Route path="product-approval" element={
                              <Suspense fallback={<LoadingFallback message="Loading approvals..." />}>
                                <ProductApproval />
                              </Suspense>
                            } />
                            <Route path="orders" element={
                              <Suspense fallback={<LoadingFallback message="Loading orders..." />}>
                                <AdminOrders />
                              </Suspense>
                            } />
                            <Route path="users" element={
                              <Suspense fallback={<LoadingFallback message="Loading users..." />}>
                                <AdminUsers />
                              </Suspense>
                            } />
                            <Route path="users/view/:userId" element={
                              <Suspense fallback={<LoadingFallback message="Loading user details..." />}>
                                <UserViewPage />
                              </Suspense>
                            } />
                            <Route path="users/edit/:userId" element={
                              <Suspense fallback={<LoadingFallback message="Loading user edit form..." />}>
                                <UserEditPage />
                              </Suspense>
                            } />
                            <Route path="vendors" element={
                              <Suspense fallback={<LoadingFallback message="Loading vendors..." />}>
                                <AdminVendorManagement />
                              </Suspense>
                            } />
                            <Route path="analytics" element={
                              <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
                                <Analytics />
                              </Suspense>
                            } />
                            <Route path="promocodes" element={
                              <Suspense fallback={<LoadingFallback message="Loading promo codes..." />}>
                                <PromoCodes />
                              </Suspense>
                            } />
                            <Route path="offers" element={
                              <Suspense fallback={<LoadingFallback message="Loading offers..." />}>
                                <OffersManager />
                              </Suspense>
                            } />
                            <Route path="holidays" element={
                              <Suspense fallback={<LoadingFallback message="Loading holidays..." />}>
                                <HolidayManagement />
                              </Suspense>
                            } />
                            <Route path="settings" element={
                              <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
                                <AdminSettingsPage />
                              </Suspense>
                            } />
                            <Route path="/admin/orders/:orderId" element={
                              <Suspense fallback={<LoadingFallback message="Loading order details..." />}>
                                <OrderDetailsPage />
                              </Suspense>
                            } />
                          </Route>

                          {/* Vendor Panel Routes - Protected and Lazy Loaded */}
                          <Route path="/vendor" element={
                            <Suspense fallback={<LoadingFallback message="Loading vendor panel..." />}>
                              <VendorProtectedRoute />
                            </Suspense>
                          }>
                            <Route element={
                              <Suspense fallback={<LoadingFallback message="Loading vendor layout..." />}>
                                <VendorLayout />
                              </Suspense>
                            }>
                              <Route path="dashboard" element={
                                <Suspense fallback={<LoadingFallback message="Loading dashboard..." />}>
                                  <VendorDashboard />
                                </Suspense>
                              } />
                              <Route path="products" element={
                                <Suspense fallback={<LoadingFallback message="Loading products..." />}>
                                  <VendorProducts />
                                </Suspense>
                              } />
                              <Route path="products/new" element={
                                <Suspense fallback={<LoadingFallback message="Loading form..." />}>
                                  <ProductForm />
                                </Suspense>
                              } />
                              <Route path="products/edit/:id" element={
                                <Suspense fallback={<LoadingFallback message="Loading form..." />}>
                                  <ProductForm />
                                </Suspense>
                              } />
                              <Route path="orders" element={
                                <Suspense fallback={<LoadingFallback message="Loading orders..." />}>
                                  <VendorOrders />
                                </Suspense>
                              } />
                              <Route path="orders/:orderId" element={
                                <Suspense fallback={<LoadingFallback message="Loading order details..." />}>
                                  <OrderDetailsPage />
                                </Suspense>
                              } />
                              <Route path="analytics" element={
                                <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
                                  <VendorAnalytics />
                                </Suspense>
                              } />
                              <Route path="promocodes" element={
                                <Suspense fallback={<LoadingFallback message="Loading promo codes..." />}>
                                  <PromoCodes />
                                </Suspense>
                              } />
                              <Route path="offers" element={
                                <Suspense fallback={<LoadingFallback message="Loading offers..." />}>
                                  <OffersManager />
                                </Suspense>
                              } />
                              <Route path="holidays" element={
                                <Suspense fallback={<LoadingFallback message="Loading holidays..." />}>
                                  <HolidayManagement />
                                </Suspense>
                              } />
                              <Route path="payouts" element={
                                <Suspense fallback={<LoadingFallback message="Loading payouts..." />}>
                                  <VendorPayouts />
                                </Suspense>
                              } />
                              <Route path="settings" element={
                                <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
                                  <VendorSettings />
                                </Suspense>
                              } />
                            </Route>
                          </Route>
                          <Route path="/vendor/register" element={
                            <Suspense fallback={<LoadingFallback message="Loading registration..." />}>
                              <VendorRegistration />
                            </Suspense>
                          } />

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </TooltipProvider>
                </NotificationProvider>
              </SettingsProvider>
            </CurrencyProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
