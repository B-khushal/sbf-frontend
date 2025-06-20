import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProductForm from '@/pages/Admin/ProductForm';
import TermsPage from "@/pages/TermsPage";
import ShippingPage from "./pages/ShippingPrivacy";
import PrivacyPage from "./pages/PrivacyPage";
import ErrorBoundary from '@/components/ErrorBoundary';

// Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import WishlistPage from "./pages/wishlist";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardHome from "./pages/Admin/Dashboard";
import AdminProducts from "./pages/Admin/Products";
import AdminOrders from "./pages/Admin/Orders";
import AdminUsers from "./pages/Admin/Users";
import OrderDetailsPage from "./pages/Admin/OrderDetailsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import Analytics from "./pages/Admin/Analytics";


// Checkout Pages
import CheckoutShippingPage from "./pages/CheckoutShippingPage";
import CheckoutPaymentPage from "./pages/CheckoutPaymentPage";
import CheckoutConfirmationPage from "./pages/CheckoutConfirmationPage";

// Lazy loaded pages
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

const queryClient = new QueryClient();

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
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id"}>
          <AuthProvider>
            <CurrencyProvider>
              <SettingsProvider>
                <NotificationProvider>
                  <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading...</p>
                      </div>
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/shop/:category" element={<ShopPage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/products/:productId" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/shipping" element={<ShippingPage />} />
                      <Route path="/privacy" element={<PrivacyPage/>} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      
                      {/* Checkout Routes */}
                      <Route path="/checkout/shipping" element={
                        <ProtectedRoute>
                          <CheckoutShippingPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/checkout/payment" element={
                        <ProtectedRoute>
                          <CheckoutPaymentPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/checkout/confirmation" element={
                        <CheckoutConfirmationPage />
                      } />
                      
                      {/* Auth Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin Panel Routes - Protected */}
                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      }>
                        <Route index element={<AdminDashboardHome />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="settings" element={<AdminSettingsPage />} />
                        <Route path="/admin/orders/:orderId" element={<OrderDetailsPage />} />
                      </Route>
                      
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
