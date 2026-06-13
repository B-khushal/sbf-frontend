import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Instagram, AlertCircle, ExternalLink } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import api from '../services/api';
import { cn } from '@/lib/utils';

interface SocialPost {
  _id: string;
  embedUrl: string;
  isActive: boolean;
  displayOrder: number;
}

// Global state to load Instagram script only once
let scriptPromise: Promise<void> | null = null;
const loadInstagramScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('instagram-embed-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'instagram-embed-script';
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });

  return scriptPromise;
};

// Sub-component for individual Instagram Embed Card
const InstagramEmbedCard: React.FC<{ embedUrl: string }> = ({ embedUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  // Parse check for a valid Instagram URL format
  const isValid = useMemo(() => {
    if (!embedUrl) return false;
    try {
      const cleanUrl = embedUrl.trim().toLowerCase();
      const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      if (!parsed.hostname.includes('instagram.com')) return false;
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const validTypes = ['p', 'reel', 'tv', 'reels'];
      return pathParts.some((part) => validTypes.includes(part));
    } catch (e) {
      return false;
    }
  }, [embedUrl]);

  // Clean URL to make sure it is a standard Instagram link for the fallback button
  const cleanPostUrl = useMemo(() => {
    try {
      const clean = embedUrl.trim().split('?')[0];
      return clean.startsWith('http') ? clean : `https://${clean}`;
    } catch {
      return embedUrl;
    }
  }, [embedUrl]);

  useEffect(() => {
    if (!isValid) {
      setHasFailed(true);
      return;
    }

    let timer: NodeJS.Timeout;
    let observer: MutationObserver;

    if (containerRef.current) {
      // 6-second timeout before rendering fallback card
      timer = setTimeout(() => {
        const iframe = containerRef.current?.querySelector('iframe');
        if (!iframe) {
          setHasFailed(true);
        }
      }, 6000);

      // Watch for Instagram script injecting the iframe inside our container
      observer = new MutationObserver(() => {
        const iframe = containerRef.current?.querySelector('iframe');
        if (iframe) {
          setIsLoaded(true);
          clearTimeout(timer);
        }
      });

      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [embedUrl, isValid]);

  if (hasFailed) {
    return (
      <div className="w-full max-w-[320px] md:max-w-none mx-auto mb-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full min-h-[350px] flex flex-col justify-center items-center p-6 bg-gradient-to-b from-[#FFF5F8] to-[#FFF0F4] border border-[#FBCFE8] rounded-2xl shadow-sm space-y-4 text-center transition-all duration-350 hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-800 font-serif">Unable to load this Instagram post</h4>
            <p className="text-xs text-gray-400 max-w-[220px]">This post may be private, deleted, or blocked by your browser extensions.</p>
          </div>
          <a
            href={cleanPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#db2777] hover:bg-[#be185d] text-white rounded-full transition-all duration-200 shadow-sm hover:shadow"
          >
            <Instagram className="w-3.5 h-3.5" />
            View on Instagram
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[320px] md:max-w-none mx-auto relative group">
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 w-full min-h-[450px] bg-white border border-[#FFF0F5] rounded-2xl p-4 flex flex-col space-y-4 animate-pulse z-10 shadow-sm">
          {/* Header Area */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFE4E1]/50" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-[#FFE4E1]/50 rounded" />
              <div className="h-2 w-1/4 bg-[#FFE4E1]/50 rounded" />
            </div>
          </div>
          {/* Media Box */}
          <div className="aspect-[4/5] w-full bg-[#FFE4E1]/40 rounded-xl" />
          {/* Text Area */}
          <div className="space-y-2 pt-1">
            <div className="h-2.5 w-full bg-[#FFE4E1]/40 rounded" />
            <div className="h-2.5 w-5/6 bg-[#FFE4E1]/40 rounded" />
          </div>
        </div>
      )}

      {/* Embed Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        ref={containerRef}
        className={cn(
          "w-full overflow-hidden bg-white border border-[#FBCFE8]/30 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5",
          !isLoaded && "invisible h-0 min-h-0 py-0 overflow-hidden"
        )}
      >
        <blockquote
          className="instagram-media"
          data-instgrm-captioned
          data-instgrm-permalink={cleanPostUrl}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: '0',
            borderRadius: '16px',
            margin: '0px',
            padding: '0px',
            width: '100%',
            display: 'block',
          }}
        />
      </motion.div>
    </div>
  );
};

export const SocialFeed: React.FC = () => {
  const { homeSections } = useSettings();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings variables
  const section = homeSections?.find((s) => s.type === 'social');
  const sectionTitle = section?.title || 'Share Your Joy #SBFlorist';
  const sectionSubtitle = section?.subtitle || "See how our customers celebrate life's moments. Follow us on Instagram for daily bouquet inspiration.";
  const instagramUrl = section?.content?.instagramUrl || 'https://www.instagram.com/sbf_india';

  // Fetch active social feeds from database
  useEffect(() => {
    const getFeeds = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/social-feed?active=true');
        setPosts(res.data || []);
      } catch (err) {
        console.error('Error fetching social feed posts:', err);
        setError('Unable to load social feed.');
      } finally {
        setLoading(false);
      }
    };
    getFeeds();
  }, []);

  // Process Instagram Embeds after component loading finishes
  useEffect(() => {
    if (loading || posts.length === 0) return;

    const timeoutId = setTimeout(() => {
      loadInstagramScript()
        .then(() => {
          if (window.instgrm?.Embeds) {
            window.instgrm.Embeds.process();
          }
        })
        .catch((err) => {
          console.error('Failed to load Instagram embeds:', err);
        });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [posts, loading]);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#FAF8FA] to-[#fff7fa]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#fce7f3] hover:bg-[#fbcfe8] transition-colors px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#db2777] uppercase mb-4 shadow-sm"
          >
            <Instagram className="h-3.5 w-3.5" />
            Social Feed
          </a>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 leading-tight font-serif">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Loading skeleton grids */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center w-full">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full max-w-[320px] md:max-w-none mx-auto min-h-[450px] bg-white border border-[#FFF0F5] rounded-2xl p-4 flex flex-col space-y-4 animate-pulse shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFE4E1]/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-[#FFE4E1]/50 rounded" />
                    <div className="h-2 w-1/4 bg-[#FFE4E1]/50 rounded" />
                  </div>
                </div>
                <div className="aspect-[4/5] w-full bg-[#FFE4E1]/40 rounded-xl" />
                <div className="space-y-2 pt-1">
                  <div className="h-2.5 w-full bg-[#FFE4E1]/40 rounded" />
                  <div className="h-2.5 w-5/6 bg-[#FFE4E1]/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 border border-dashed border-[#FBCFE8] bg-white/50 backdrop-blur-sm rounded-3xl max-w-md mx-auto shadow-sm"
          >
            <Instagram className="w-10 h-10 text-pink-300 mx-auto mb-3" />
            <p className="text-gray-500 font-serif italic text-sm sm:text-base">
              Instagram posts will appear here soon.
            </p>
          </motion.div>
        )}

        {/* Responsive Grid Layout */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center w-full">
            {posts.map((post) => (
              <InstagramEmbedCard key={post._id} embedUrl={post.embedUrl} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default SocialFeed;
