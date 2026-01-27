// Performance utilities for optimizing website loading

interface PreloadOptions {
  as: 'script' | 'style' | 'image' | 'font' | 'fetch';
  crossorigin?: 'anonymous' | 'use-credentials';
  type?: string;
  media?: string;
  onload?: () => void;
  onerror?: () => void;
}

// Performance monitoring utility for tracking page load times and user interactions

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface ApiCallMetrics {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private apiCalls: ApiCallMetrics[] = [];
  private metrics: Partial<PerformanceMetrics> = {};
  private isProduction = import.meta.env.PROD;

  private constructor() {
    if (!this.isProduction) {
      this.initializePerformanceObserver();
      this.trackPageLoad();
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Track Web Vitals
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.largestContentfulPaint = entry.startTime;
          }
          
          if (entry.entryType === 'first-input') {
            this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
          }
          
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.metrics.cumulativeLayoutShift = (this.metrics.cumulativeLayoutShift || 0) + (entry as any).value;
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      // Silent fail in production
    }
  }

  private trackPageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
          this.metrics.timeToInteractive = navigation.domInteractive - navigation.navigationStart;
        }

        // Track First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.firstContentfulPaint = fcpEntry.startTime;
        }

        this.logMetrics();
      }, 0);
    });
  }

  public trackApiCall(url: string, method: string, startTime: number, status: number) {
    if (this.isProduction) return;

    const duration = performance.now() - startTime;
    const metric: ApiCallMetrics = {
      url,
      method,
      duration,
      status,
      timestamp: Date.now()
    };

    this.apiCalls.push(metric);

    // Keep only last 50 API calls to prevent memory issues
    if (this.apiCalls.length > 50) {
      this.apiCalls = this.apiCalls.slice(-50);
    }

    // Log slow API calls
    if (duration > 2000) {
      console.warn(`🐌 Slow API call detected: ${method} ${url} took ${duration.toFixed(2)}ms`);
    }
  }

  public getSlowApiCalls(threshold = 1000): ApiCallMetrics[] {
    return this.apiCalls.filter(call => call.duration > threshold);
  }

  public getAverageApiCallTime(): number {
    if (this.apiCalls.length === 0) return 0;
    const total = this.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return total / this.apiCalls.length;
  }

  public trackMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window) || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100, // MB
      total: Math.round((memory.totalJSHeapSize / 1048576) * 100) / 100, // MB
      limit: Math.round((memory.jsHeapSizeLimit / 1048576) * 100) / 100, // MB
    };
  }

  public trackComponentRender(componentName: string, startTime: number) {
    if (this.isProduction) return;

    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // More than one frame (16ms at 60fps)
      console.warn(`🎨 Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  public trackLargeBundle() {
    if (typeof window === 'undefined') return;

    // Track when main bundle loads
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('index') || src.includes('main')) {
        fetch(src, { method: 'HEAD' })
          .then(response => {
            const size = response.headers.get('content-length');
            if (size && parseInt(size) > 500000) { // 500KB
              console.warn(`📦 Large bundle detected: ${src} is ${(parseInt(size) / 1024).toFixed(2)}KB`);
            }
          })
          .catch(() => {}); // Silent fail
      }
    });
  }

  private logMetrics() {
    if (this.isProduction) return;

    console.group('📊 Performance Metrics');
    console.log('Page Load Time:', this.metrics.pageLoadTime?.toFixed(2), 'ms');
    console.log('First Contentful Paint:', this.metrics.firstContentfulPaint?.toFixed(2), 'ms');
    console.log('Largest Contentful Paint:', this.metrics.largestContentfulPaint?.toFixed(2), 'ms');
    console.log('Time to Interactive:', this.metrics.timeToInteractive?.toFixed(2), 'ms');
    console.log('First Input Delay:', this.metrics.firstInputDelay?.toFixed(2), 'ms');
    console.log('Cumulative Layout Shift:', this.metrics.cumulativeLayoutShift?.toFixed(4));
    
    const memory = this.trackMemoryUsage();
    if (memory) {
      console.log('Memory Usage:', `${memory.used}MB / ${memory.total}MB (limit: ${memory.limit}MB)`);
    }
    
    const avgApiTime = this.getAverageApiCallTime();
    if (avgApiTime > 0) {
      console.log('Average API Call Time:', avgApiTime.toFixed(2), 'ms');
    }
    
    const slowCalls = this.getSlowApiCalls();
    if (slowCalls.length > 0) {
      console.warn('Slow API Calls:', slowCalls);
    }
    
    console.groupEnd();
  }

  public getPerformanceReport() {
    return {
      metrics: this.metrics,
      apiCalls: this.apiCalls,
      slowApiCalls: this.getSlowApiCalls(),
      averageApiTime: this.getAverageApiCallTime(),
      memoryUsage: this.trackMemoryUsage()
    };
  }

  // Clean up resources
  public cleanup() {
    this.apiCalls = [];
    this.metrics = {};
  }
}

// Helper functions for easy usage
export const performanceMonitor = PerformanceMonitor.getInstance();

export const trackApiCall = (url: string, method: string, startTime: number, status: number) => {
  performanceMonitor.trackApiCall(url, method, startTime, status);
};

export const trackComponentRender = (componentName: string) => {
  const startTime = performance.now();
  return () => performanceMonitor.trackComponentRender(componentName, startTime);
};

export const trackMemoryUsage = () => performanceMonitor.trackMemoryUsage();

export const getPerformanceReport = () => performanceMonitor.getPerformanceReport();

// Utility to measure function execution time
export const measureExecutionTime = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (!import.meta.env.PROD && end - start > 10) {
      console.log(`⏱️ ${name} execution time: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
};

// Cache performance tracking
export const trackCacheHit = (key: string, hit: boolean) => {
  if (!import.meta.env.PROD) {
    console.log(`💾 Cache ${hit ? 'HIT' : 'MISS'} for key: ${key}`);
  }
};

// Image loading performance
export const trackImageLoad = (src: string, startTime: number) => {
  if (!import.meta.env.PROD) {
    const loadTime = performance.now() - startTime;
    if (loadTime > 1000) {
      console.warn(`🖼️ Slow image load: ${src} took ${loadTime.toFixed(2)}ms`);
    }
  }
};

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

// Preload critical images (only on homepage)
export const preloadCriticalImages = (): void => {
  // Only preload images if we're on the homepage or likely to use them
  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/' || currentPath === '/home';
  
  if (!isHomePage) return;

  const criticalImages = [
    '/images/logosbf.png', // Logo - always needed
  ];

  // Only preload hero images on homepage
  if (isHomePage) {
    criticalImages.push('/images/1.jpg'); // First hero image only
  }

  criticalImages.forEach(imageUrl => {
    // Check if image actually exists before preloading
    const img = new Image();
    img.onload = () => {
      preloadResource(imageUrl, {
        as: 'image',
        onload: () => console.log(`Preloaded: ${imageUrl}`),
        onerror: () => console.warn(`Failed to preload: ${imageUrl}`)
      });
    };
    img.onerror = () => console.warn(`Image not found, skipping preload: ${imageUrl}`);
    img.src = imageUrl;
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

  // Setup intersection observer for lazy loading with performance optimizations
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  const lazyLoadObserver = new IntersectionObserver((entries) => {
    // Use requestAnimationFrame to avoid forced reflows
    requestAnimationFrame(() => {
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
    });
  }, observerOptions);

  // Observe all lazy loading candidates
  document.querySelectorAll('[data-src]').forEach(el => {
    lazyLoadObserver.observe(el);
  });

  // Optimize layout thrashing
  optimizeLayoutPerformance();

  return lazyLoadObserver;
};

// Optimize layout performance to reduce forced reflows
export const optimizeLayoutPerformance = () => {
  // Add critical CSS for above-the-fold content
  const criticalCSS = `
    /* Prevent layout shift for images */
    img {
      content-visibility: auto;
      contain-intrinsic-size: 300px 200px;
    }
    
    /* Optimize transform and opacity for animations */
    .transform-gpu {
      transform: translateZ(0);
      will-change: transform, opacity;
    }
    
    /* Reduce paint complexity */
    * {
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Optimize scrolling */
    .scroll-smooth {
      scroll-behavior: smooth;
      overflow-scrolling: touch;
    }
  `;

  // Inject critical CSS
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);

  // Debounce resize events to prevent thrashing
  let resizeTimeout: number;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      // Handle resize logic here
      window.dispatchEvent(new Event('optimized-resize'));
    }, 250);
  };

  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimeout);
  };
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