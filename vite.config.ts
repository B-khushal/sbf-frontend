import { defineConfig, type ViteDevServer, type PreviewServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";
import path from "path";
import fs from "fs";
import http, { type IncomingMessage, type ServerResponse } from "http";
import https from "https";

interface RouteSeoEntry {
  title: string;
  description: string;
  h1: string;
  canonical: string;
}

const SEO_ROUTE_MAP: Record<string, RouteSeoEntry> = {
  "/shop": {
    title: "Shop Flowers, Bouquets, Cakes & Gifts Online | Spring Blossoms Florist",
    description: "Shop fresh flowers, handcrafted bouquets, celebration cakes, indoor plants, chocolates, and gift combos online at Spring Blossoms Florist.",
    h1: "Shop Flowers, Bouquets, Cakes & Gifts Online",
    canonical: "https://sbflorist.in/shop",
  },
  "/about": {
    title: "About Spring Blossoms Florist | Spring Blossoms Florist",
    description: "Learn about Spring Blossoms Florist, our floral craftsmanship, values, and commitment to delivering fresh flowers, cakes, and thoughtful gifts.",
    h1: "About Spring Blossoms Florist",
    canonical: "https://sbflorist.in/about",
  },
  "/contact": {
    title: "Contact Spring Blossoms Florist | Spring Blossoms Florist",
    description: "Contact Spring Blossoms Florist for inquiries about flower bouquets, custom floral arrangements, celebration cakes, and gift orders.",
    h1: "Contact Spring Blossoms Florist",
    canonical: "https://sbflorist.in/contact",
  },
  "/shipping": {
    title: "Flower & Gift Delivery Information | Spring Blossoms Florist",
    description: "Read our flower, cake, and gift shipping and delivery information, including delivery slots, coverage areas, and order handling at Spring Blossoms Florist.",
    h1: "Flower & Gift Delivery Information",
    canonical: "https://sbflorist.in/shipping",
  },
  "/refund-policy": {
    title: "Refund Policy | Spring Blossoms Florist",
    description: "Review the Refund Policy of Spring Blossoms Florist, including eligibility, timelines, and refund processing methods for flower, cake, and gift orders.",
    h1: "Refund Policy",
    canonical: "https://sbflorist.in/refund-policy",
  },
  "/cancellation-policy": {
    title: "Cancellation Policy | Spring Blossoms Florist",
    description: "Read the Cancellation Policy for flower, cake, and gift orders placed with Spring Blossoms Florist.",
    h1: "Cancellation Policy",
    canonical: "https://sbflorist.in/cancellation-policy",
  },
  "/flower-delivery-hyderabad": {
    title: "Flower Delivery in Hyderabad | Same-Day & Midnight Florist | SB Florist",
    description: "Order fresh flowers, roses, cakes & combos in Hyderabad with Spring Blossoms Florist. 1st Order Free Delivery, Free Delivery on ₹999+, Same-Day & Midnight Delivery across all Hyderabad areas.",
    h1: "Flower Delivery in Hyderabad",
    canonical: "https://sbflorist.in/flower-delivery-hyderabad",
  },
  "/flower-delivery-secunderabad": {
    title: "Flower Delivery in Secunderabad | Same-Day & Midnight Florist | SB Florist",
    description: "Send fresh flowers, bouquets, cakes & gift hampers to Secunderabad with Spring Blossoms Florist. 1st Order Free Delivery, Free Delivery on ₹999+, Same-Day & Midnight Delivery across Secunderabad.",
    h1: "Flower Delivery in Secunderabad",
    canonical: "https://sbflorist.in/flower-delivery-secunderabad",
  },
  "/shop/cakes": {
    title: "Order Cakes Online | Spring Blossoms Florist",
    description: "Order freshly crafted cakes online for birthdays, anniversaries and special celebrations. Discover chocolate, red velvet, black forest, fruit cakes and gift combinations at Spring Blossoms Florist.",
    h1: "Order Cakes Online",
    canonical: "https://sbflorist.in/shop/cakes",
  },
  "/cakes": {
    title: "Order Cakes Online | Spring Blossoms Florist",
    description: "Order freshly crafted cakes online for birthdays, anniversaries and special celebrations. Discover chocolate, red velvet, black forest, fruit cakes and gift combinations at Spring Blossoms Florist.",
    h1: "Order Cakes Online",
    canonical: "https://sbflorist.in/cakes",
  },
  "/shop/combos": {
    title: "Flowers, Cakes & Gift Combos | Spring Blossoms Florist",
    description: "Make celebrations memorable with flowers, cakes and gift combos from Spring Blossoms Florist. Explore curated gift combinations for birthdays, anniversaries and special moments.",
    h1: "Flowers, Cakes & Gift Combos",
    canonical: "https://sbflorist.in/shop/combos",
  },
  "/combos": {
    title: "Flowers, Cakes & Gift Combos | Spring Blossoms Florist",
    description: "Make celebrations memorable with flowers, cakes and gift combos from Spring Blossoms Florist. Explore curated gift combinations for birthdays, anniversaries and special moments.",
    h1: "Flowers, Cakes & Gift Combos",
    canonical: "https://sbflorist.in/combos",
  },
  "/shop/plants": {
    title: "Shop Plants Online | Spring Blossoms Florist",
    description: "Shop indoor plants, air-purifying greens, succulents, and potted plant gifts online at Spring Blossoms Florist for homes, offices, and thoughtful gifting.",
    h1: "Shop Plants Online",
    canonical: "https://sbflorist.in/shop/plants",
  },
  "/shop/bouquets": {
    title: "Fresh Flower Bouquets | Spring Blossoms Florist",
    description: "Explore fresh flower bouquets for birthdays, anniversaries, and special occasions. Browse handcrafted floral styles and order your favorite bouquet online.",
    h1: "Fresh Flower Bouquets",
    canonical: "https://sbflorist.in/shop/bouquets",
  },
  "/shop/chocolates": {
    title: "Shop Chocolates Online | Spring Blossoms Florist",
    description: "Order chocolate bouquets, gourmet chocolate hampers, and sweet gift sets online from Spring Blossoms Florist for birthdays, anniversaries, and celebrations.",
    h1: "Shop Chocolates Online",
    canonical: "https://sbflorist.in/shop/chocolates",
  },
  "/occasions": {
    title: "Shop Flowers & Gifts by Occasion | Spring Blossoms Florist",
    description: "Explore handcrafted flower bouquets, cakes, and gift hampers for every occasion including birthdays, anniversaries, romance, sympathy, and congratulations.",
    h1: "Shop Flowers & Gifts by Occasion",
    canonical: "https://sbflorist.in/occasions",
  },
  "/occasions/romance": {
    title: "Romantic Flowers & Gifts | Spring Blossoms Florist",
    description: "Express your love with romantic flowers, red rose bouquets, and thoughtful gifts from Spring Blossoms Florist.",
    h1: "Romantic Flowers & Gifts",
    canonical: "https://sbflorist.in/occasions/romance",
  },
  "/occasions/birthday": {
    title: "Birthday Flowers & Gifts | Spring Blossoms Florist",
    description: "Celebrate birthdays with vibrant flower bouquets, delicious cakes, and curated gift combos from Spring Blossoms Florist.",
    h1: "Birthday Flowers & Gifts",
    canonical: "https://sbflorist.in/occasions/birthday",
  },
  "/occasions/sympathy": {
    title: "Sympathy Flowers & Condolence Gifts | Spring Blossoms Florist",
    description: "Send peaceful sympathy flowers, white lily arrangements, and condolence gifts with care from Spring Blossoms Florist.",
    h1: "Sympathy Flowers & Condolence Gifts",
    canonical: "https://sbflorist.in/occasions/sympathy",
  },
  "/occasions/anniversary": {
    title: "Anniversary Flowers & Gifts | Spring Blossoms Florist",
    description: "Mark special milestones with anniversary flowers, luxury rose bouquets, cakes, and gift hampers from Spring Blossoms Florist.",
    h1: "Anniversary Flowers & Gifts",
    canonical: "https://sbflorist.in/occasions/anniversary",
  },
  "/occasions/get-well-soon": {
    title: "Get Well Soon Flowers & Gifts | Spring Blossoms Florist",
    description: "Brighten their recovery with cheerful get well soon flowers, fresh bouquets, and thoughtful gifts from Spring Blossoms Florist.",
    h1: "Get Well Soon Flowers & Gifts",
    canonical: "https://sbflorist.in/occasions/get-well-soon",
  },
  "/occasions/congratulations": {
    title: "Congratulations Flowers & Gifts | Spring Blossoms Florist",
    description: "Celebrate achievements and milestones with congratulations flowers, bouquets, and gift hampers from Spring Blossoms Florist.",
    h1: "Congratulations Flowers & Gifts",
    canonical: "https://sbflorist.in/occasions/congratulations",
  },
  "/sitemap": {
    title: "XML Sitemap Index | Spring Blossoms Florist",
    description: "Explore the interactive sitemap directory for Spring Blossoms Florist, including pages, categories, products, and occasions across Hyderabad and Secunderabad.",
    h1: "XML Sitemap Index",
    canonical: "https://sbflorist.in/sitemap",
  },
  "/sitemap/pages": {
    title: "Static & Location Pages Sitemap | Spring Blossoms Florist",
    description: "Browse canonical static pages, Hyderabad and Secunderabad delivery hubs, policy pages, and customer FAQs at Spring Blossoms Florist.",
    h1: "Static & Location Pages Sitemap",
    canonical: "https://sbflorist.in/sitemap/pages",
  },
  "/sitemap/categories": {
    title: "Product Categories Sitemap | Spring Blossoms Florist",
    description: "Browse all active flower, bouquet, cake, chocolate, and gift combo categories at Spring Blossoms Florist.",
    h1: "Product Categories Sitemap",
    canonical: "https://sbflorist.in/sitemap/categories",
  },
  "/sitemap/products": {
    title: "Products Catalog Sitemap | Spring Blossoms Florist",
    description: "Browse all approved handcrafted flower bouquets, celebration cakes, and gift arrangements at Spring Blossoms Florist.",
    h1: "Products Catalog Sitemap",
    canonical: "https://sbflorist.in/sitemap/products",
  },
  "/sitemap/occasions": {
    title: "Occasions & Celebrations Sitemap | Spring Blossoms Florist",
    description: "Browse curated celebration collections for birthdays, anniversaries, romance, sympathy, and festive occasions at Spring Blossoms Florist.",
    h1: "Occasions & Celebrations Sitemap",
    canonical: "https://sbflorist.in/sitemap/occasions",
  },
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const applyRouteSeoToHtml = (html: string, routePath: string): string => {
  const normalizedPath = routePath.split("?")[0].replace(/\/+$/, "") || "/";
  const seo = SEO_ROUTE_MAP[normalizedPath];
  if (!seo) return html;

  const safeTitle = escapeHtml(seo.title);
  const safeDesc = escapeHtml(seo.description);
  const safeH1 = escapeHtml(seo.h1);
  const safeCanonical = escapeHtml(seo.canonical);

  let updated = html;
  updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  updated = updated.replace(
    /<meta\s+name="description"\s+content="[^"]*"[^>]*>/i,
    `<meta name="description" content="${safeDesc}" data-rh="true" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"[^>]*>/i,
    `<meta property="og:title" content="${safeTitle}" data-rh="true" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"[^>]*>/i,
    `<meta property="og:description" content="${safeDesc}" data-rh="true" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"[^>]*>/i,
    `<meta property="og:url" content="${safeCanonical}" data-rh="true" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"[^>]*>/i,
    `<meta name="twitter:title" content="${safeTitle}" data-rh="true" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"[^>]*>/i,
    `<meta name="twitter:description" content="${safeDesc}" data-rh="true" />`
  );
  updated = updated.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"[^>]*>/i,
    `<link rel="canonical" href="${safeCanonical}" data-rh="true" />`
  );
  updated = updated.replace(
    /<script\s+type="application\/ld\+json"\s+data-prerendered-seo="home">[\s\S]*?<\/script>\s*/gi,
    ""
  );
  updated = updated.replace(
    /<h1[^>]*>[\s\S]*?<\/h1>/i,
    `<h1 style="font-size: 2.25rem; font-weight: 900; color: #0f172a; line-height: 1.25; margin-bottom: 1rem;">${safeH1}</h1>`
  );

  return updated;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const backendTarget = process.env.VITE_BACKEND_URL || (isProd ? 'https://api.sbflorist.in' : 'http://127.0.0.1:5000');

  const proxySitemapRequest = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url && /^\/sitemap.*\.xml(\?.*)?$/.test(req.url)) {
      const serveStaticXmlFallback = () => {
        const cleanFile = (req.url || '/sitemap.xml').split('?')[0].replace(/^\/+/, '') || 'sitemap.xml';
        const distFile = path.resolve(__dirname, 'dist', cleanFile);
        const publicFile = path.resolve(__dirname, 'public', cleanFile);
        const targetFile = fs.existsSync(distFile) ? distFile : (fs.existsSync(publicFile) ? publicFile : null);
        if (targetFile) {
          const xmlContent = fs.readFileSync(targetFile, 'utf-8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.end(xmlContent);
          return;
        }
        next();
      };

      try {
        const targetUrl = new URL(req.url, backendTarget);
        const isTargetHttps = targetUrl.protocol === 'https:';
        const client = isTargetHttps ? https : http;
        const proxyReq = client.request(targetUrl, {
          method: req.method || 'GET',
          headers: {
            ...req.headers,
            host: targetUrl.host,
            accept: 'application/xml, text/xml;q=0.9, */*;q=0.8'
          }
        }, (proxyRes) => {
          const contentType = String(proxyRes.headers['content-type'] || '').toLowerCase();
          if ((proxyRes.statusCode || 500) >= 400 || !contentType.includes('xml')) {
            proxyRes.resume();
            serveStaticXmlFallback();
            return;
          }
          res.writeHead(proxyRes.statusCode || 200, {
            ...proxyRes.headers,
            'content-type': 'application/xml; charset=utf-8'
          });
          proxyRes.pipe(res);
        });
        proxyReq.on('error', () => serveStaticXmlFallback());
        req.pipe(proxyReq);
        return;
      } catch (err) {
        serveStaticXmlFallback();
        return;
      }
    }
    next();
  };

  return {
  base: '/',
  server: {
    host: "::",
    port: 8081,
    // Enable SPA fallback for development
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: isProd ? 'https://api.sbflorist.in' : 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'sitemap-and-seo-route-plugin',
      transformIndexHtml(html, ctx) {
        const reqUrl = ctx.originalUrl || ctx.path || '/';
        return applyRouteSeoToHtml(html, reqUrl);
      },
      configureServer(server: ViteDevServer) {
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
          proxySitemapRequest(req, res, () => next());
        });
      },
      configurePreviewServer(server: PreviewServer) {
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
          proxySitemapRequest(req, res, () => {
            const rawUrl = (req.url || '/').split('?')[0].replace(/\/+$/, '') || '/';
            if (req.method === 'GET' && SEO_ROUTE_MAP[rawUrl]) {
              const distIndex = path.resolve(__dirname, 'dist', 'index.html');
              if (fs.existsSync(distIndex)) {
                const baseHtml = fs.readFileSync(distIndex, 'utf-8');
                const routeHtml = applyRouteSeoToHtml(baseHtml, rawUrl);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(routeHtml);
                return;
              }
            }
            next();
          });
        });
      },
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const distIndex = path.join(distDir, 'index.html');
        if (!fs.existsSync(distIndex)) return;

        const baseHtml = fs.readFileSync(distIndex, 'utf-8');
        for (const routePath of Object.keys(SEO_ROUTE_MAP)) {
          const relativeRoute = routePath.replace(/^\/+/, '');
          if (!relativeRoute) continue;
          const routeHtml = applyRouteSeoToHtml(baseHtml, routePath);
          const targetDir = path.join(distDir, relativeRoute);
          fs.mkdirSync(targetDir, { recursive: true });
          fs.writeFileSync(path.join(targetDir, 'index.html'), routeHtml, 'utf-8');
        }
      },
    },
    mode === 'development' && componentTagger(),
    // Add compression plugin for production builds
    mode === 'production' && compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false,
    }),
    // Add Brotli compression for better compression ratio
    mode === 'production' && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ['react', 'react-dom'],
  },
  // Optimize build for better performance
  build: {
    // Enable source maps for production debugging (optional, disable for smaller builds)
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize rollup options for better code splitting
    rollupOptions: {
      output: {
        // Optimize chunk file names
        chunkFileNames: () => {
          return `assets/[name]-[hash].js`;
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          const info = name.split('.');
          const extType = info.length > 1 ? info[info.length - 1] : 'bin';
          if (name && /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return `assets/images/[name]-[hash].${extType}`;
          } else if (name && /\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        }
      }
    },
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'date-fns',
      'recharts',
      'react-signature-canvas',
    ],
    exclude: ['@dnd-kit/core', '@dnd-kit/sortable'] // These can be loaded dynamically
  },
  // Preview server settings for production testing
  preview: {
    port: 8081,
    host: "::",
    // Enable SPA fallback for preview mode
    historyApiFallback: true,
  },
};
});
