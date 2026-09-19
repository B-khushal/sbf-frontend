import { API_URL } from '@/config';

// Spring Blossoms Florist — Non-blocking, Privacy-Conscious Marketing Intelligence Tracker

interface TrackEvent {
  eventType: string;
  eventCategory?: string;
  url?: string;
  path?: string;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productCategory?: string;
  occasion?: string;
  searchQuery?: string;
  cartValue?: number;
  orderId?: string;
  orderNumber?: string;
  revenue?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
}

class MarketingTracker {
  private visitorId: string = '';
  private sessionId: string = '';
  private eventQueue: TrackEvent[] = [];
  private flushTimer: any = null;
  private trackedMilestones: Set<number> = new Set();
  private scrollAttached: boolean = false;
  private currentPath: string = '';
  private sessionData: Record<string, any> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSession();
      this.initScrollTracker();
    }
  }

  private initSession() {
    try {
      // 1. Persistent Visitor ID
      let vid = localStorage.getItem('sbf_vid');
      if (!vid) {
        vid = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        localStorage.setItem('sbf_vid', vid);
      }
      this.visitorId = vid;

      // 2. Session ID
      let sid = sessionStorage.getItem('sbf_sid');
      if (!sid) {
        sid = `sid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        sessionStorage.setItem('sbf_sid', sid);
      }
      this.sessionId = sid;

      // 3. Extract & cache UTM parameters
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const utmContent = urlParams.get('utm_content');
      const utmTerm = urlParams.get('utm_term');

      if (utmCampaign) {
        sessionStorage.setItem('sbf_utm_campaign', utmCampaign);
        if (utmSource) sessionStorage.setItem('sbf_utm_source', utmSource);
        if (utmMedium) sessionStorage.setItem('sbf_utm_medium', utmMedium);
        if (utmContent) sessionStorage.setItem('sbf_utm_content', utmContent);
        if (utmTerm) sessionStorage.setItem('sbf_utm_term', utmTerm);
      }

      // 4. Traffic source detection
      let trafficSource = sessionStorage.getItem('sbf_traffic_source');
      if (!trafficSource) {
        const ref = document.referrer.toLowerCase();
        if (utmSource) {
          trafficSource = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
        } else if (ref.includes('instagram.com')) {
          trafficSource = 'Instagram';
        } else if (ref.includes('facebook.com')) {
          trafficSource = 'Facebook';
        } else if (ref.includes('google.com') || ref.includes('google.co.in')) {
          trafficSource = 'Google';
        } else if (ref.includes('whatsapp') || ref.includes('wa.me')) {
          trafficSource = 'WhatsApp';
        } else if (ref && !ref.includes(window.location.hostname)) {
          trafficSource = 'Referral';
        } else {
          trafficSource = 'Direct';
        }
        sessionStorage.setItem('sbf_traffic_source', trafficSource);
      }

      // 5. Device detection
      const width = window.innerWidth;
      const device = width < 768 ? 'Mobile' : width < 1024 ? 'Tablet' : 'Desktop';

      this.sessionData = {
        device,
        trafficSource,
        utmSource: utmSource || sessionStorage.getItem('sbf_utm_source') || undefined,
        utmMedium: utmMedium || sessionStorage.getItem('sbf_utm_medium') || undefined,
        utmCampaign: utmCampaign || sessionStorage.getItem('sbf_utm_campaign') || undefined,
        utmContent: utmContent || sessionStorage.getItem('sbf_utm_content') || undefined,
        utmTerm: utmTerm || sessionStorage.getItem('sbf_utm_term') || undefined,
        landingPage: sessionStorage.getItem('sbf_landing_page') || window.location.pathname
      };

      if (!sessionStorage.getItem('sbf_landing_page')) {
        sessionStorage.setItem('sbf_landing_page', window.location.pathname);
      }
    } catch (e) {
      // Non-blocking fallback
    }
  }

  // Scroll milestone tracking (25, 50, 75, 90, 100%) - throttled without keystroke or cursor tracking
  private initScrollTracker() {
    if (this.scrollAttached || typeof window === 'undefined') return;
    this.scrollAttached = true;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.checkScrollMilestones();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  private checkScrollMilestones() {
    try {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      const milestones = [25, 50, 75, 90, 100];

      for (const m of milestones) {
        if (scrollPercent >= m && !this.trackedMilestones.has(m)) {
          this.trackedMilestones.add(m);
          this.enqueueEvent({
            eventType: 'scroll_depth',
            eventCategory: 'Engagement',
            path: this.currentPath,
            metadata: { milestone: m, percent: scrollPercent }
          });
        }
      }
    } catch (e) {
      // Non-blocking
    }
  }

  // Enqueue event and buffer
  public enqueueEvent(event: TrackEvent) {
    try {
      const completeEvent: TrackEvent = {
        ...event,
        url: window.location.href,
        path: event.path || window.location.pathname,
        timestamp: new Date().toISOString()
      };

      this.eventQueue.push(completeEvent);

      if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => {
          this.flush();
        }, 1500);
      }
    } catch (e) {
      // Fail silently
    }
  }

  // Flush queued events asynchronously
  public flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    const payload = JSON.stringify({
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      userId: this.getUserId(),
      sessionData: this.sessionData,
      events: eventsToSend
    });

    const endpoint = `${API_URL}/marketing/events`;

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      } else {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {
      // Never block UI
    }
  }

  private getUserId(): string | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        return u.id || u._id || null;
      }
    } catch (e) {}
    return null;
  }

  // -------------------------------------------------------------
  // Public High-Level Tracking Methods
  // -------------------------------------------------------------

  public trackPageView(path: string, title?: string) {
    this.currentPath = path;
    this.trackedMilestones.clear(); // Reset scroll milestones for new page

    this.enqueueEvent({
      eventType: 'page_view',
      eventCategory: 'Navigation',
      path,
      metadata: { title: title || document.title }
    });
  }

  public trackProductView(product: { id: string; title: string; price?: number; category?: string; occasion?: string }) {
    this.enqueueEvent({
      eventType: 'product_view',
      eventCategory: 'Product',
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productCategory: product.category,
      occasion: product.occasion,
      path: window.location.pathname
    });
  }

  public trackProductImageView(productId: string, imageIndex: number) {
    this.enqueueEvent({
      eventType: 'product_image_view',
      eventCategory: 'Product',
      productId,
      metadata: { imageIndex }
    });
  }

  public trackAddToCart(product: { id: string; title: string; price: number; quantity?: number; category?: string }, cartTotal?: number) {
    this.enqueueEvent({
      eventType: 'add_to_cart',
      eventCategory: 'Cart',
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productCategory: product.category,
      cartValue: cartTotal || product.price * (product.quantity || 1),
      metadata: { quantity: product.quantity || 1 }
    });
    this.flush(); // Flush immediately for cart events
  }

  public trackCheckoutStep(step: 'checkout_started' | 'address_completed' | 'payment_started', cartValue?: number) {
    this.enqueueEvent({
      eventType: step,
      eventCategory: 'Checkout',
      cartValue,
      path: window.location.pathname
    });
    this.flush();
  }

  public trackPurchase(orderId: string, orderNumber: string, revenue: number) {
    this.enqueueEvent({
      eventType: 'purchase',
      eventCategory: 'Orders',
      orderId,
      orderNumber,
      revenue,
      cartValue: revenue,
      path: window.location.pathname
    });
    this.flush();
  }

  public trackSearch(query: string, resultCount: number = 0) {
    this.enqueueEvent({
      eventType: resultCount === 0 ? 'zero_result_search' : 'search',
      eventCategory: 'Search',
      searchQuery: query,
      metadata: { resultCount }
    });
  }

  public trackInteraction(action: string, metadata?: Record<string, any>) {
    this.enqueueEvent({
      eventType: action,
      eventCategory: 'Engagement',
      metadata
    });
  }

  // Identity Stitching when user logs in or checks out
  public async stitchIdentity(userId: string, email?: string, name?: string, phone?: string) {
    try {
      if (!this.visitorId) return;
      await fetch(`${API_URL}/marketing/stitch-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.visitorId,
          userId,
          email,
          customerName: name,
          customerPhone: phone
        })
      });
    } catch (e) {
      // Non-blocking
    }
  }
}

export const marketingTracker = new MarketingTracker();
