// Performance utilities for optimizing website loading

interface PreloadOptions {
  as: 'script' | 'style' | 'image' | 'font' | 'fetch';
  crossorigin?: 'anonymous' | 'use-credentials';
  type?: string;
  media?: string;
  onload?: () => void;
  onerror?: () => void;
}

// Preload critical resources
export const preloadResource = (href: string, options: PreloadOptions): void => {
  if (typeof window === 'undefined') return;

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = options.as;
  
  if (options.crossorigin) {
    link.crossOrigin = options.crossorigin;
  }
  
  if (options.type) {
    link.type = options.type;
  }
  
  if (options.media) {
    link.media = options.media;
  }

  if (options.onload) {
    link.onload = options.onload;
  }

  if (options.onerror) {
    link.onerror = options.onerror;
  }

  document.head.appendChild(link);
};

// Preload critical fonts
export const preloadCriticalFonts = (): void => {
  const criticalFonts = [
    // Add your critical font URLs here
    // '/fonts/inter-var.woff2',
    // '/fonts/inter-bold.woff2',
  ];

  criticalFonts.forEach(fontUrl => {
    preloadResource(fontUrl, {
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    });
  });
};

// Preload critical images
export const preloadCriticalImages = (): void => {
  const criticalImages = [
    '/images/logosbf.png', // Logo
    '/images/1.jpg', // Hero image
    '/images/placeholder.svg', // Placeholder
  ];

  criticalImages.forEach(imageUrl => {
    preloadResource(imageUrl, {
      as: 'image',
      onload: () => console.log(`Preloaded: ${imageUrl}`),
      onerror: () => console.warn(`Failed to preload: ${imageUrl}`)
    });
  });
};

// Prefetch next page resources
export const prefetchRoute = (route: string): void => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
};

// DNS prefetch for external domains
export const dnsPrefetch = (domain: string): void => {
  if (typeof window === 'undefined') return;

  const existing = document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
};

// Setup critical DNS prefetches
export const setupDNSPrefetch = (): void => {
  const externalDomains = [
    'https://res.cloudinary.com', // Cloudinary images
    'https://fonts.googleapis.com', // Google Fonts
    'https://fonts.gstatic.com', // Google Fonts static
    'https://checkout.razorpay.com', // Razorpay
    'https://www.google-analytics.com', // Analytics
  ];

  externalDomains.forEach(dnsPrefetch);
};

// Performance monitoring
export const measurePerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  // Wait for page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        // Page load timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        
        // Network timing
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        
        // Paint timing
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        
        // Time to Interactive (approximation)
        timeToInteractive: navigation.domInteractive - navigation.navigationStart,
      };

      // Log performance metrics (remove in production or send to analytics)
      console.table(metrics);

      // You can send these metrics to your analytics service
      // trackPerformanceMetrics(metrics);
    }, 0);
  });
};

// Resource loading optimization
export const optimizeResourceLoading = () => {
  if (typeof window === 'undefined') return;

  // Preload critical resources
  preloadCriticalFonts();
  preloadCriticalImages();
  setupDNSPrefetch();

  // Setup intersection observer for lazy loading
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;
        
        // Handle lazy loading for images
        if (target.tagName === 'IMG' && target.dataset.src) {
          (target as HTMLImageElement).src = target.dataset.src;
          target.removeAttribute('data-src');
          lazyLoadObserver.unobserve(target);
        }
        
        // Handle lazy loading for iframes
        if (target.tagName === 'IFRAME' && target.dataset.src) {
          (target as HTMLIFrameElement).src = target.dataset.src;
          target.removeAttribute('data-src');
          lazyLoadObserver.unobserve(target);
        }
      }
    });
  }, observerOptions);

  // Observe all lazy loading candidates
  document.querySelectorAll('[data-src]').forEach(el => {
    lazyLoadObserver.observe(el);
  });

  return lazyLoadObserver;
};

// Memory management utilities
export const cleanupMemory = () => {
  // Clear unused image objects
  if (typeof window !== 'undefined' && window.gc) {
    window.gc();
  }
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Bundle analyzer helper (development only)
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available at build time');
    console.log('Run `npm run build` to see chunk sizes');
  }
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  // Setup critical resource loading
  optimizeResourceLoading();
  
  // Start performance monitoring
  measurePerformance();
  
  // Register service worker for caching
  registerServiceWorker();
  
  // Log bundle info in development
  logBundleInfo();
};

export default {
  preloadResource,
  preloadCriticalFonts,
  preloadCriticalImages,
  prefetchRoute,
  dnsPrefetch,
  setupDNSPrefetch,
  measurePerformance,
  optimizeResourceLoading,
  cleanupMemory,
  registerServiceWorker,
  initializePerformanceOptimizations,
}; 