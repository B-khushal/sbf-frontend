import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Heart,
  Flower2,
  Gift,
  CreditCard,
  Truck,
  ShieldCheck,
  Store,
  Lock
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import api from '@/services/api';

const Footer = () => {
  const { footerSettings, loading } = useSettings();
  const [email, setEmail] = useState('');

  // WhatsApp contact number - using just the number without +91
  const whatsappNumber = "9949683222";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I'm interested in your flower arrangements.`;

  // Unpack settings for Razorpay Secure Payments
  const securePaymentEnabled = footerSettings.securePaymentEnabled ?? true;
  const securePaymentHeaderText = footerSettings.securePaymentHeaderText || "Secure Payments by";
  const securePaymentHighlightText = footerSettings.securePaymentHighlightText || "100% Safe & Encrypted Transactions";
  const securePaymentGatewayText = footerSettings.securePaymentGatewayText || "Trusted Payment Gateway";
  const securePaymentTrustText = footerSettings.securePaymentTrustText || "Trusted by Millions of Businesses";

  const renderRazorpayLogo = (isMobile = false) => {
    if (footerSettings.securePaymentLogoType === 'custom' && footerSettings.securePaymentCustomLogo) {
      return (
        <img
          src={footerSettings.securePaymentCustomLogo}
          alt="Razorpay Logo"
          className={`${isMobile ? 'h-5' : 'h-6'} w-auto object-contain`}
        />
      );
    }
    return (
      <div className={`flex items-center gap-1.5 ${isMobile ? 'px-2 py-0.5' : 'px-2.5 py-1'} bg-sky-50 rounded-full border border-sky-100 shadow-sm`}>
        <svg className={`${isMobile ? 'h-3' : 'h-3.5'} w-auto fill-[#0F3F94]`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Razorpay Logo">
          <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
        </svg>
        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold text-[#0F3F94] tracking-tight`}>Razorpay</span>
      </div>
    );
  };

  const renderPaymentBadge = (id: string, defaultSvgFn: (isMobile: boolean) => React.ReactNode, titleText: string, isMobile = false) => {
    const enabled = (footerSettings as any)[`paymentMethod${id}Enabled`] ?? true;
    const type = (footerSettings as any)[`paymentMethod${id}Type`] || 'default';
    const url = (footerSettings as any)[`paymentMethod${id}Url`] || '';

    if (!enabled) return null;

    return (
      <div
        className={`${isMobile ? 'h-7 px-2' : 'h-8 px-2.5'} rounded bg-white border border-gray-200 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:shadow-sm transition-all duration-200 group`}
        title={titleText}
      >
        {type === 'custom' && url ? (
          <img
            src={url}
            alt={titleText}
            className={`${isMobile ? 'h-4' : 'h-5'} w-auto object-contain group-hover:scale-105 transition-transform`}
          />
        ) : (
          <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
            {defaultSvgFn(isMobile)}
          </div>
        )}
      </div>
    );
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/newsletter/subscribe', { email });

      if (response.data.success) {
        toast.success("Thanks for subscribing!", {
          description: "We'll keep you updated with our latest offers.",
        });
        setEmail('');
      } else {
        toast.error("Subscription failed", {
          description: response.data.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error("Subscription failed", {
        description: errorMessage,
      });
    }
  };

  if (loading) {
    return (
      <footer className="bg-secondary/40 pt-12 sm:pt-16 pb-6 sm:pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading footer...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gradient-to-br from-secondary/40 via-secondary/30 to-secondary/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:hidden rounded-t-3xl bg-white border-t border-sky-100 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] px-4 pt-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-gray-900">
              <Flower2 className="w-5 h-5 text-primary" />
              {footerSettings.companyName}
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">Fresh flowers delivered with love 🌸</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              { label: 'Track Order', href: '/profile' },
              { label: 'Contact', href: '/contact' },
              { label: 'About', href: '/about' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm font-medium text-gray-700 hover:border-pink-200 hover:bg-pink-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <a href={`tel:${footerSettings.contactInfo.phone}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4 text-primary" />
                {footerSettings.contactInfo.phone}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-2 text-sm font-semibold text-white shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm text-gray-700">
              <a href={footerSettings.socialLinks.find((link) => link.platform === 'Instagram')?.url || 'https://www.instagram.com/sbf_india'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <Instagram className="w-4 h-4 text-primary" />
                Instagram
              </a>
              <div className="inline-flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-primary" />
                Hyderabad
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <details className="group rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none text-sm font-bold text-gray-800 flex items-center justify-between">
                <span>Customer Support</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link to="/contact" className="rounded-xl bg-white border border-gray-100/60 px-3 py-2.5 text-gray-700 text-center hover:bg-pink-50/40">Contact</Link>
                <Link to="/profile" className="rounded-xl bg-white border border-gray-100/60 px-3 py-2.5 text-gray-700 text-center hover:bg-pink-50/40">Track Order</Link>
              </div>
            </details>
            <details className="group rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none text-sm font-bold text-gray-800 flex items-center justify-between">
                <span>Company Policies</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link to="/shipping" className="rounded-xl bg-white border border-gray-100/60 px-3 py-2.5 text-gray-700 text-center hover:bg-pink-50/40">Shipping Policy</Link>
                <Link to="/refund-policy" className="rounded-xl bg-white border border-gray-100/60 px-3 py-2.5 text-gray-700 text-center hover:bg-pink-50/40">Refund Policy</Link>
                <Link to="/cancellation-policy" className="rounded-xl bg-white border border-gray-100/60 px-3 py-2.5 text-gray-700 text-center hover:bg-pink-50/40">Cancellation</Link>
                <Link to="/privacy" className="rounded-xl bg-white border border-gray-100/60 px-3 py-2.5 text-gray-700 text-center hover:bg-pink-50/40">Privacy Policy</Link>
              </div>
            </details>
          </div>

          {/* Mobile Secure Payments Section */}
          {securePaymentEnabled && (
            <div className="border-t border-sky-100 pt-4 pb-2 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold text-gray-800">{securePaymentHeaderText}</span>
                {renderRazorpayLogo(true)}
              </div>
              
              <div className="space-y-1">
                <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {securePaymentHighlightText}
                </p>
                <p className="text-[10px] text-gray-500">
                  {securePaymentGatewayText} • {securePaymentTrustText}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {renderPaymentBadge("Upi", (isMobile) => <svg className={`${isMobile ? 'h-2.5' : 'h-3'} w-auto`} viewBox="0 0 38 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 10.5L13.8 4H12L11 7H8.8L9.5 4H7.5L6.1 10.5H7.8L8.5 7.5H10.5L9.8 10.5H12.5ZM17.8 4H14L12.5 10.5H14.2L15 7H16.8C17.8 7 18.5 6.3 18.8 5.3C19.1 4.3 18.5 4 17.8 4ZM16.8 5.8H15.2L15.6 4.8H16.8C17.1 4.8 17.3 4.9 17.2 5.2C17.1 5.5 16.9 5.8 16.8 5.8ZM21.8 4L20.4 10.5H22.1L23.5 4H21.8Z" fill="#0F3F94"/><path d="M25 4L24 8.5L23 7.5L22.2 8.2L24 10.5L25.8 4H25Z" fill="#0F8F49"/></svg>, "UPI", true)}
                {renderPaymentBadge("Visa", (isMobile) => <svg viewBox="0 0 36 12" className={`${isMobile ? 'h-2.5' : 'h-3'} w-auto`} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.6 0.2H9.8L6.1 9.6L5.3 1.8C5.2 0.7 4.2 0.2 3.1 0.2H0L0.1 0.5C1.9 1 3.5 1.7 4.7 2.4C5.4 2.8 5.6 3.2 5.8 4.1L8.3 11.8H12.2L18.1 0.2H13.6ZM24.6 8C24.6 5.1 20.6 4.9 20.6 3.5C20.6 3.1 21.0 2.6 22.0 2.5C22.5 2.4 23.9 2.4 25.4 3L26.1 0.5C24.8 0.1 23.3 0 21.6 0C19.0 0 17.1 1.4 17.1 3.4C17.1 6.3 21.1 6.4 21.1 7.9C21.1 8.3 20.7 8.8 19.7 8.9C19.1 9 17.7 8.9 16.1 8.2L15.4 10.8C16.9 11.4 18.7 11.8 20.5 11.8C23.2 11.8 24.6 10.4 24.6 8ZM32.3 0.2H29.3C28.4 0.2 27.7 0.7 27.3 1.6L22.8 11.8H26.7L27.5 9.6H32.3L32.8 11.8H36.2L32.3 0.2ZM28.4 7.2L30.5 2L31.7 7.2H28.4ZM18.2 0.2L14.4 11.8H18.2L22.0 0.2H18.2Z" fill="#1A1F71"/></svg>, "Visa", true)}
                {renderPaymentBadge("Mastercard", (isMobile) => <svg viewBox="0 0 24 16" className={`${isMobile ? 'h-3' : 'h-4'} w-auto`} fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#EB001B"/><circle cx="16" cy="8" r="8" fill="#F79E1B" fillOpacity="0.8"/><path d="M12 2.1C10.7 3.5 9.9 5.3 9.9 7.3C9.9 9.3 10.7 11.1 12 12.5C13.3 11.1 14.1 9.3 14.1 7.3C14.1 5.3 13.3 3.5 12 2.1Z" fill="#FF5F00"/></svg>, "Mastercard", true)}
                {renderPaymentBadge("RuPay", (isMobile) => <svg viewBox="0 0 45 12" className={`${isMobile ? 'h-2.5' : 'h-3'} w-auto`} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.6 2.3C4.6 1 3.5 0 2.2 0H0V11.8H2.3V7.2H3.5L6.6 11.8H9.3L5.9 6.8C6.9 6.3 7.6 5.2 7.6 3.9C7.6 3.3 7.4 2.8 7.1 2.3H4.6ZM2.3 5.0H2.2V2.2H2.3C3.2 2.2 3.9 2.8 3.9 3.6C3.9 4.4 3.2 5.0 2.3 5.0Z" fill="#0B4D97"/><path d="M12.4 3.6C12.4 1.6 10.8 0 8.8 0H5.8V11.8H8.8C10.8 11.8 12.4 10.2 12.4 8.2V3.6ZM10.1 8.2C10.1 8.9 9.5 9.5 8.8 9.5H8.1V2.3H8.8C9.5 2.3 10.1 2.9 10.1 3.6V8.2Z" fill="#0B4D97"/><path d="M17.1 0.2H14.1L12.5 11.8H14.9L15.3 8.7H17.8L18.1 11.8H20.6L19 0.2ZM15.5 6.4L15.9 2.5L17.5 6.4H15.5Z" fill="#0B4D97"/><path d="M21.5 0L19.5 11.8H21.5L23.5 0H21.5Z" fill="#EA7623"/><path d="M24 0L22 11.8H24L26 0H24Z" fill="#A4C639"/><path d="M27.5 3.5V0.2H29.5V3.5C29.5 4.5 30.2 5.2 31.2 5.2C32.2 5.2 32.9 4.5 32.9 3.5V0.2H34.9V3.5C34.9 5.6 33.2 7.2 31.2 7.2C29.2 7.2 27.5 5.6 27.5 3.5Z" fill="#A4C639"/><path d="M36.5 0.2H38.5C39.8 0.2 40.8 1.2 40.8 2.5C40.8 3.8 39.8 4.8 38.5 4.8H38.2V7.2H36.5V0.2ZM38.5 3.1C38.9 3.1 39.1 2.8 39.1 2.5C39.1 2.2 38.9 1.9 38.5 1.9H38.2V3.1H38.5Z" fill="#A4C639"/></svg>, "RuPay", true)}
                {renderPaymentBadge("NetBanking", (isMobile) => <div className="flex items-center gap-1 text-gray-700"><svg viewBox="0 0 24 24" className="h-3 w-auto text-gray-650" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="22" width="20" height="2" /><path d="M12 2L2 7h20L12 2z" fill="currentColor" fillOpacity="0.1" /><path d="M4 22V11M20 22V11M8 22V11M16 22V11M12 22V11" /></svg><span className="text-[8px] font-bold text-gray-500">NB</span></div>, "Net Banking", true)}
                {renderPaymentBadge("Wallets", (isMobile) => <div className="flex items-center gap-1 text-gray-700"><svg viewBox="0 0 24 24" className="h-3 w-auto text-gray-650" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" fill="currentColor" fillOpacity="0.1" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg><span className="text-[8px] font-bold text-gray-500">WALLETS</span></div>, "Wallets", true)}
                {renderPaymentBadge("Emi", (isMobile) => <div className="flex items-center gap-1 text-gray-700"><svg viewBox="0 0 24 24" className="h-3 w-auto text-gray-650" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M7 15h2M12 15h4" /></svg><span className="text-[8px] font-bold text-gray-500">EMI</span></div>, "EMI Available", true)}
              </div>
            </div>
          )}

          <p className="pt-1 text-center text-[12px] text-[#777]">
            © 2026 SB Florist. All rights reserved.
          </p>
        </div>

        <div className="hidden md:block">
        {/* Newsletter Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/90 to-secondary/90 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
              <div className="text-center lg:text-left w-full lg:w-auto">
                <h3 className="text-xl sm:text-xl lg:text-2xl font-bold mb-3 text-white leading-tight">Subscribe to Our Newsletter</h3>
                <p className="text-white/90 text-sm lg:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">Get updates on new arrivals and special offers!</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 min-w-0">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 w-full sm:w-[280px] lg:w-[300px] min-w-0 h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="secondary" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto whitespace-nowrap px-6 py-3 h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Send className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8 xl:gap-12 mb-10 sm:mb-12">
          {/* Brand & Info */}
          <div className="text-center sm:text-left space-y-5 sm:space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 text-2xl font-bold text-gray-900 hover:text-primary transition-colors duration-300">
              <Flower2 className="w-7 h-7 text-primary" />
              {footerSettings.companyName}
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
              Best florist in Hyderabad offering flower delivery in Hyderabad, online bouquet shop India, midnight flower delivery,
              roses for anniversary, and birthday flowers online. Send flowers online with confidence.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
              {/* WhatsApp Link */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md"
                aria-label="WhatsApp"
                title="Chat with us on WhatsApp"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              {/* Social Links */}
              {footerSettings.socialLinks
                .filter(link => link.enabled)
                .map((link) => {
                  const IconComponent =
                    link.platform === 'Instagram' ? Instagram :
                      link.platform === 'Facebook' ? Facebook :
                        link.platform === 'Twitter' ? Twitter : Instagram;

                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md"
                      aria-label={link.platform}
                    >
                      <IconComponent className="w-6 h-6" />
                    </a>
                  );
                })
              }
            </div>
          </div>

          {/* Quick Links */}
          {footerSettings.links.map((section) => (
            <div key={section.section} className="text-center sm:text-left">
              <h3 className="text-lg font-bold mb-6 text-gray-900">{section.section}</h3>
              <ul className="space-y-4">
                {section.items
                  .filter(item => item.enabled)
                  .map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="text-gray-600 hover:text-primary transition-all duration-300 inline-flex items-center gap-3 group text-sm font-medium"
                      >
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold mb-6 text-gray-900">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Email Us</p>
                  <a
                    href={`mailto:${footerSettings.contactInfo.email}`}
                    className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm break-all"
                  >
                    {footerSettings.contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Call Us</p>
                  <a
                    href={`tel:${footerSettings.contactInfo.phone}`}
                    className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {footerSettings.contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Visit Us</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {footerSettings.contactInfo.address}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold mb-1 text-gray-900">Business Hours</p>
                  <p className="text-gray-600 text-sm">Mon - Sun: 9:00 AM - 9:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 py-8 sm:py-10 border-t border-gray-200">
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Free Delivery</p>
              <p className="text-xs text-gray-600">On orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Secure Payment</p>
              <p className="text-xs text-gray-600">100% secure checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Special Offers</p>
              <p className="text-xs text-gray-600">Save up to 25% off</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900">Made with Love</p>
              <p className="text-xs text-gray-600">Handcrafted flowers</p>
            </div>
          </div>
        </div>

        {/* Secure Payments by Razorpay Trust Section */}
        {securePaymentEnabled && (
          <div className="py-8 border-t border-gray-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Trust Badges & Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-semibold text-gray-800 tracking-wide">{securePaymentHeaderText}</span>
                    {renderRazorpayLogo()}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 justify-center sm:justify-start text-emerald-600 font-medium">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {securePaymentHighlightText}
                    </span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="font-medium">{securePaymentGatewayText}</span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="text-gray-500">{securePaymentTrustText}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Badges */}
              <div className="flex flex-col items-center lg:items-end gap-2">
                <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Multiple Payment Options Available</span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {renderPaymentBadge("Upi", (isMobile) => <svg className={`${isMobile ? 'h-2.5' : 'h-3'} w-auto`} viewBox="0 0 38 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 10.5L13.8 4H12L11 7H8.8L9.5 4H7.5L6.1 10.5H7.8L8.5 7.5H10.5L9.8 10.5H12.5ZM17.8 4H14L12.5 10.5H14.2L15 7H16.8C17.8 7 18.5 6.3 18.8 5.3C19.1 4.3 18.5 4 17.8 4ZM16.8 5.8H15.2L15.6 4.8H16.8C17.1 4.8 17.3 4.9 17.2 5.2C17.1 5.5 16.9 5.8 16.8 5.8ZM21.8 4L20.4 10.5H22.1L23.5 4H21.8Z" fill="#0F3F94"/><path d="M25 4L24 8.5L23 7.5L22.2 8.2L24 10.5L25.8 4H25Z" fill="#0F8F49"/></svg>, "UPI (GPay, PhonePe, Paytm)", false)}
                  {renderPaymentBadge("Visa", (isMobile) => <svg viewBox="0 0 36 12" className={`${isMobile ? 'h-2.5' : 'h-3'} w-auto`} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.6 0.2H9.8L6.1 9.6L5.3 1.8C5.2 0.7 4.2 0.2 3.1 0.2H0L0.1 0.5C1.9 1 3.5 1.7 4.7 2.4C5.4 2.8 5.6 3.2 5.8 4.1L8.3 11.8H12.2L18.1 0.2H13.6ZM24.6 8C24.6 5.1 20.6 4.9 20.6 3.5C20.6 3.1 21.0 2.6 22.0 2.5C22.5 2.4 23.9 2.4 25.4 3L26.1 0.5C24.8 0.1 23.3 0 21.6 0C19.0 0 17.1 1.4 17.1 3.4C17.1 6.3 21.1 6.4 21.1 7.9C21.1 8.3 20.7 8.8 19.7 8.9C19.1 9 17.7 8.9 16.1 8.2L15.4 10.8C16.9 11.4 18.7 11.8 20.5 11.8C23.2 11.8 24.6 10.4 24.6 8ZM32.3 0.2H29.3C28.4 0.2 27.7 0.7 27.3 1.6L22.8 11.8H26.7L27.5 9.6H32.3L32.8 11.8H36.2L32.3 0.2ZM28.4 7.2L30.5 2L31.7 7.2H28.4ZM18.2 0.2L14.4 11.8H18.2L22.0 0.2H18.2Z" fill="#1A1F71"/></svg>, "Visa Credit/Debit Card", false)}
                  {renderPaymentBadge("Mastercard", (isMobile) => <svg viewBox="0 0 24 16" className={`${isMobile ? 'h-3' : 'h-4'} w-auto`} fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#EB001B"/><circle cx="16" cy="8" r="8" fill="#F79E1B" fillOpacity="0.8"/><path d="M12 2.1C10.7 3.5 9.9 5.3 9.9 7.3C9.9 9.3 10.7 11.1 12 12.5C13.3 11.1 14.1 9.3 14.1 7.3C14.1 5.3 13.3 3.5 12 2.1Z" fill="#FF5F00"/></svg>, "Mastercard Credit/Debit Card", false)}
                  {renderPaymentBadge("RuPay", (isMobile) => <svg viewBox="0 0 45 12" className={`${isMobile ? 'h-2.5' : 'h-3'} w-auto`} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.6 2.3C4.6 1 3.5 0 2.2 0H0V11.8H2.3V7.2H3.5L6.6 11.8H9.3L5.9 6.8C6.9 6.3 7.6 5.2 7.6 3.9C7.6 3.3 7.4 2.8 7.1 2.3H4.6ZM2.3 5.0H2.2V2.2H2.3C3.2 2.2 3.9 2.8 3.9 3.6C3.9 4.4 3.2 5.0 2.3 5.0Z" fill="#0B4D97"/><path d="M12.4 3.6C12.4 1.6 10.8 0 8.8 0H5.8V11.8H8.8C10.8 11.8 12.4 10.2 12.4 8.2V3.6ZM10.1 8.2C10.1 8.9 9.5 9.5 8.8 9.5H8.1V2.3H8.8C9.5 2.3 10.1 2.9 10.1 3.6V8.2Z" fill="#0B4D97"/><path d="M17.1 0.2H14.1L12.5 11.8H14.9L15.3 8.7H17.8L18.1 11.8H20.6L19 0.2ZM15.5 6.4L15.9 2.5L17.5 6.4H15.5Z" fill="#0B4D97"/><path d="M21.5 0L19.5 11.8H21.5L23.5 0H21.5Z" fill="#EA7623"/><path d="M24 0L22 11.8H24L26 0H24Z" fill="#A4C639"/><path d="M27.5 3.5V0.2H29.5V3.5C29.5 4.5 30.2 5.2 31.2 5.2C32.2 5.2 32.9 4.5 32.9 3.5V0.2H34.9V3.5C34.9 5.6 33.2 7.2 31.2 7.2C29.2 7.2 27.5 5.6 27.5 3.5Z" fill="#A4C639"/><path d="M36.5 0.2H38.5C39.8 0.2 40.8 1.2 40.8 2.5C40.8 3.8 39.8 4.8 38.5 4.8H38.2V7.2H36.5V0.2ZM38.5 3.1C38.9 3.1 39.1 2.8 39.1 2.5C39.1 2.2 38.9 1.9 38.5 1.9H38.2V3.1H38.5Z" fill="#A4C639"/></svg>, "RuPay Card", false)}
                  {renderPaymentBadge("NetBanking", (isMobile) => <div className="flex items-center gap-1.5 text-gray-700"><svg viewBox="0 0 24 24" className="h-3.5 w-auto text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="22" width="20" height="2" /><path d="M12 2L2 7h20L12 2z" fill="currentColor" fillOpacity="0.1" /><path d="M4 22V11M20 22V11M8 22V11M16 22V11M12 22V11" /></svg><span className="text-[10px] font-bold tracking-tight text-gray-500">NET BANKING</span></div>, "Net Banking", false)}
                  {renderPaymentBadge("Wallets", (isMobile) => <div className="flex items-center gap-1.5 text-gray-700"><svg viewBox="0 0 24 24" className="h-3.5 w-auto text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" fill="currentColor" fillOpacity="0.1" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg><span className="text-[10px] font-bold tracking-tight text-gray-500">WALLETS</span></div>, "Wallets", false)}
                  {renderPaymentBadge("Emi", (isMobile) => <div className="flex items-center gap-1.5 text-gray-700"><svg viewBox="0 0 24 24" className="h-3.5 w-auto text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M7 15h2M12 15h4" /></svg><span className="text-[10px] font-bold tracking-tight text-gray-500">EMI AVAILABLE</span></div>, "EMI Options Available", false)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 space-y-6 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 font-medium">
            <p className="text-center sm:text-left">
              {footerSettings.copyright}
            </p>
            <Link to="/vendors-consent" className="inline-flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold uppercase tracking-wider">
                <Store className="w-3.5 h-3.5" /> Become a Vendor
              </span>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 sm:gap-x-8 gap-y-3 text-sm">
            <Link
              to="/terms"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              to="/shipping"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Shipping Policy
            </Link>
            <Link
              to="/refund-policy"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Refund Policy
            </Link>
            <Link
              to="/cancellation-policy"
              className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
            >
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Local SEO Keywords Section */}
      <div className="border-t border-gray-200 mt-8 pt-8">
        <details className="group border border-gray-200 bg-white/60 backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none flex items-center justify-between text-base font-bold text-gray-800">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🌸 Flower Delivery Services & Florist Locations in Hyderabad
            </span>
            <span className="text-primary group-open:rotate-180 transition-transform duration-300 text-sm">▼</span>
          </summary>
          <div className="mt-4 text-xs sm:text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
            <p>
              Looking for the best <strong>florist Hyderabad</strong> has to offer? SB Florist is the <strong>best florist in Hyderabad</strong> and your premier choice for <strong>flower delivery Hyderabad</strong>. We provide <strong>fresh flowers delivery Hyderabad</strong> for every occasion with <strong>online flower delivery Hyderabad</strong>. We specialize in <strong>same day flower delivery Hyderabad</strong> and <strong>midnight flower delivery Hyderabad</strong> to make your celebrations extra special.
            </p>
            <p>
              As a leading <strong>flower shop Hyderabad</strong>, we are the <strong>online florist Hyderabad</strong> that customers trust. From <strong>bouquet delivery Hyderabad</strong> and <strong>rose bouquet delivery Hyderabad</strong> to <strong>birthday flower delivery Hyderabad</strong>, <strong>anniversary flower delivery Hyderabad</strong>, and <strong>wedding flowers Hyderabad</strong>, our expert team designs breathtaking <strong>flower arrangements Hyderabad</strong>. Whether you need <strong>luxury flower delivery Hyderabad</strong> for a grand occasion or <strong>affordable flower delivery Hyderabad</strong> and <strong>cheap flower delivery Hyderabad</strong>, our <strong>premium flowers Hyderabad</strong> collection has something for everyone.
            </p>
            <p>
              We offer convenient options like <strong>flower bouquet online Hyderabad</strong>, <strong>send flowers to Hyderabad</strong>, <strong>Hyderabad flower delivery service</strong>, <strong>flowers home delivery Hyderabad</strong>, <strong>express flower delivery Hyderabad</strong>, and <strong>24 hour flower delivery Hyderabad</strong>. Find <strong>flowers near me Hyderabad</strong> easily and order <strong>red roses delivery Hyderabad</strong>, <strong>orchid delivery Hyderabad</strong>, <strong>lily flower delivery Hyderabad</strong>, a lovely <strong>carnation bouquet Hyderabad</strong>, or a <strong>mixed flower bouquet Hyderabad</strong>.
            </p>
            <p>
              Celebrate special milestones with <strong>romantic flower delivery Hyderabad</strong>, <strong>Valentine's Day flowers Hyderabad</strong>, <strong>Mother's Day flower delivery Hyderabad</strong>, <strong>congratulations flowers Hyderabad</strong>, <strong>get well soon flowers Hyderabad</strong>, and <strong>sympathy flowers Hyderabad</strong>. We also offer <strong>flower and cake delivery Hyderabad</strong>, <strong>flowers and gifts Hyderabad</strong>, and <strong>flower basket delivery Hyderabad</strong>. Customize your order with a <strong>customized bouquet Hyderabad</strong> or complete an <strong>online bouquet order Hyderabad</strong> easily.
            </p>
            <p>
              We deliver to all key areas including finding a <strong>florist near Hyderabad airport</strong> or ordering a prompt <strong>flower delivery in Gachibowli</strong>, <strong>flower delivery in Hitech City</strong>, <strong>flower delivery in Banjara Hills</strong>, <strong>flower delivery in Jubilee Hills</strong>, <strong>flower delivery in Kondapur</strong>, <strong>flower delivery in Kukatpally</strong>, and <strong>flower delivery in Secunderabad</strong>.
            </p>
          </div>
        </details>
      </div>

      {/* Map Section */}
      {footerSettings.showMap && (
        <div className="mt-10 sm:mt-12">
          <iframe
            src={footerSettings.mapEmbedUrl}
            className="w-full h-[250px] sm:h-[300px] border-0 rounded-lg shadow-lg"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}
        </div>
    </footer>
  );
};

export default Footer;
