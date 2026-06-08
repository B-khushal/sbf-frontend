import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Heart, MessageCircle, Play, Eye } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSettings } from '../contexts/SettingsContext';
import { cn } from '@/lib/utils';

const galleryItems = [
  {
    id: 1,
    type: 'post',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=600',
    likes: '412',
    comments: '28',
  },
  {
    id: 2,
    type: 'reel',
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=600',
    likes: '1.2k',
    comments: '64',
    views: '8.4k',
  },
  {
    id: 3,
    type: 'post',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=600',
    likes: '350',
    comments: '12',
  },
  {
    id: 4,
    type: 'reel',
    image: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&q=80&w=600',
    likes: '890',
    comments: '36',
    views: '5.2k',
  },
  {
    id: 5,
    type: 'post',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
    likes: '512',
    comments: '40',
  },
  {
    id: 6,
    type: 'post',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=600',
    likes: '298',
    comments: '18',
  },
];

const InstagramEmbed: React.FC<{ postUrl: string }> = ({ postUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = postUrl.match(/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    const shortcode = match ? match[1] : 'DMKYa3pzzYu';
    const cleanUrl = `https://www.instagram.com/p/${shortcode}/`;

    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${cleanUrl}?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%;">
          <div style="padding:16px;">
            <a href="${cleanUrl}?utm_source=ig_embed&amp;utm_campaign=loading" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
              <div style="display: flex; flex-direction: row; align-items: center;">
                <div style="background-color: #F4F4F4; border-radius: 50%; height: 40px; margin-right: 14px; width: 40px;"></div>
                <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                  <div style="background-color: #F4F4F4; border-radius: 4px; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                  <div style="background-color: #F4F4F4; border-radius: 4px; height: 14px; width: 60px;"></div>
                </div>
              </div>
              <div style="padding: 19% 0;"></div>
              <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg>
              </div>
              <div style="padding-top: 8px; color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-weight:550; text-align:center;">View this post on Instagram</div>
            </a>
          </div>
        </blockquote>
      `;

      // Scan and initialize the embed
      const win = window as any;
      if (win.instgrm) {
        win.instgrm.Embeds.process();
      } else {
        const id = 'instagram-embed-script';
        if (!document.getElementById(id)) {
          const script = document.createElement('script');
          script.id = id;
          script.async = true;
          script.src = '//www.instagram.com/embed.js';
          document.body.appendChild(script);
          script.onload = () => {
            if (win.instgrm) win.instgrm.Embeds.process();
          };
        }
      }
    }
  }, [postUrl]);

  return <div ref={containerRef} className="w-full flex justify-center" />;
};

export const SocialGallery: React.FC = () => {
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const { homeSections } = useSettings();

  const section = homeSections?.find(s => s.type === 'social');
  const sectionTitle = section?.title || 'Share Your Joy #SBFlorist';
  const sectionSubtitle = section?.subtitle || "See how our customers celebrate life's moments. Follow us on Instagram for daily bouquet inspiration.";
  const instagramUrl = section?.content?.instagramUrl || 'https://www.instagram.com/sbf_india';

  const instagramHandle = useMemo(() => {
    try {
      const url = new URL(instagramUrl);
      const pathname = url.pathname.replace(/^\/|\/$/g, '');
      return pathname ? `@${pathname}` : '@sbf_india';
    } catch {
      return '@sbf_india';
    }
  }, [instagramUrl]);

  const items = section?.content?.items && section.content.items.length > 0
    ? section.content.items
    : galleryItems;

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Masonry-like Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((item: any, idx: number) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              onClick={() => setActiveItem(item)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg group"
            >
              {/* Image */}
              <img
                src={item.image}
                alt="Customer joy flowers"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3 text-white">
                <Instagram className="w-6 h-6 stroke-[1.5px]" />
                
                {/* Likes / Comments */}
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Heart size={14} className="fill-current" />
                    {item.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} className="fill-current" />
                    {item.comments}
                  </span>
                </div>

                {item.type === 'reel' && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/25">
                    <Play size={12} className="fill-current text-white translate-x-[0.5px]" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Zoom Modal */}
      <Dialog open={!!activeItem} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className={cn(
          "overflow-hidden p-0 border-0 bg-white shadow-xl rounded-2xl",
          activeItem?.postUrl ? "max-w-[95vw] sm:max-w-[540px]" : "max-w-[90vw] md:max-w-md bg-transparent shadow-none"
        )}>
          {activeItem && (
            activeItem.postUrl ? (
              <div className="p-1 max-h-[85vh] overflow-y-auto flex justify-center bg-white rounded-2xl">
                <InstagramEmbed postUrl={activeItem.postUrl} />
              </div>
            ) : (
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
                <img src={activeItem.image} alt="" className="w-full h-full object-cover" />
                
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/45 to-transparent text-white flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white border border-white/20">SBF</div>
                    <div>
                      <p className="text-xs font-bold">{instagramHandle}</p>
                      <p className="text-[10px] text-white/60">Hyderabad, India</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3.5 text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="fill-current text-pink-500" />
                      {activeItem.likes}
                    </span>
                    {activeItem.type === 'reel' && (
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {activeItem.views || '5k'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
