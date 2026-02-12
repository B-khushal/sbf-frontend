import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "url";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Enable SPA fallback for development
    historyApiFallback: true,
  },
  plugins: [
    react(),
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
      "@": fileURLToPath(new URL('./src', import.meta.url)),
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
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunks - separate large libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-popover',
            '@radix-ui/react-navigation-menu'
          ],
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          'animation-vendor': [
            'framer-motion',
            '@dnd-kit/core',
            '@dnd-kit/sortable'
          ],
          'chart-vendor': ['recharts'],
          'utils': [
            'axios',
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ],
          // Admin chunks
          'admin': [
            'src/pages/Admin/Dashboard.tsx',
            'src/pages/Admin/Products.tsx',
            'src/pages/Admin/Orders.tsx',
            'src/pages/Admin/Users.tsx',
            'src/pages/Admin/Analytics.tsx',
            'src/pages/AdminSettingsPage.tsx'
          ],
          // Vendor chunks
          'vendor-pages': [
            'src/pages/Vendor/VendorDashboard.tsx',
            'src/pages/Vendor/VendorProducts.tsx',
            'src/pages/Vendor/VendorOrders.tsx',
            'src/pages/Vendor/VendorAnalytics.tsx'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${extType}`;
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
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
      'recharts'
    ],
    exclude: ['@dnd-kit/core', '@dnd-kit/sortable'] // These can be loaded dynamically
  },
  // Preview server settings for production testing
  preview: {
    port: 8080,
    host: "::",
    // Enable SPA fallback for preview mode
    historyApiFallback: true,
  },
}));
