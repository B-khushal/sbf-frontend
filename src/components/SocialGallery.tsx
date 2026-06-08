import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Heart, MessageCircle, Play, Eye } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSettings } from '../contexts/SettingsContext';

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
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-2xl overflow-hidden p-0 border-0 bg-transparent shadow-none">
          {activeItem && (
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
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
