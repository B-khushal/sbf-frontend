import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus, ShoppingBag, ChevronRight, ChevronDown, Heart, Sparkles } from 'lucide-react';
import type { ValentineGiftBuilderItem } from '@/types/valentine';
import { getImageUrl } from '@/config';
import useCart from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface ValentineGiftBuilderProps {
  items?: ValentineGiftBuilderItem[];
}

const categoryLabels: Record<string, { label: string; icon: string; description: string }> = {
  flowers: { label: 'Bouquets & Roses', icon: '🌹', description: 'Select 100 Red Roses, 50 Red Roses, or Luxury Pink Bouquets' },
  chocolates: { label: 'Chocolates & Truffles', icon: '🍫', description: 'Choose Ferrero Rocher, Cadbury Silk, or Belgian Artisan Truffles' },
  teddy: { label: 'Plush Teddy Bears', icon: '🧸', description: 'Add a giant 4ft or cuddly 2ft plush teddy bear' },
  greeting_card: { label: 'Love Greeting Card', icon: '💌', description: '3D laser-cut pop-up rose garden card' },
  photo_frame: { label: 'Acrylic Photo Frame', icon: '🖼️', description: 'Personalized heart memory frame' },
  perfume: { label: 'Luxury Perfumes', icon: '🌸', description: 'French Damascus Rose floral fragrance set' },
  custom_message: { label: 'Love Message in Bottle', icon: '✍️', description: 'Handwritten parchment message in a corked vintage bottle' },
};

const DEFAULT_GIFT_ITEMS: ValentineGiftBuilderItem[] = [
  {
    id: 'gb-heart-100-red-roses',
    name: 'Heart Bouquet of 100 Red Roses',
    category: 'flowers',
    price: 2499,
    stock: 100,
    enabled: true,
    order: 0,
    description: 'Grand heart-shaped arrangement of 100 velvet red roses.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-heart-50-red-roses',
    name: 'Heart Bouquet of 50 Red Roses',
    category: 'flowers',
    price: 1499,
    stock: 100,
    enabled: true,
    order: 1,
    description: 'Heart-shaped hand bouquet of 50 long-stemmed red roses.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-luxury-30-pink-roses',
    name: 'Luxury Bouquet of 30 Pink Roses',
    category: 'flowers',
    price: 999,
    stock: 100,
    enabled: true,
    order: 2,
    description: '30 soft garden pink roses wrapped in blush pink tissue.',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-classic-25-red-roses',
    name: 'Classic Bouquet of 25 Red Roses',
    category: 'flowers',
    price: 799,
    stock: 100,
    enabled: true,
    order: 3,
    description: 'Fresh 25 red roses tied with white gypsophila fillers.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-ferrero-heart-24',
    name: 'Ferrero Rocher Heart Box (24 Pcs)',
    category: 'chocolates',
    price: 999,
    stock: 100,
    enabled: true,
    order: 4,
    description: 'Heart-shaped box packed with 24 golden Ferrero Rocher chocolates.',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-ferrero-16',
    name: 'Ferrero Rocher Box (16 Pcs)',
    category: 'chocolates',
    price: 599,
    stock: 100,
    enabled: true,
    order: 5,
    description: 'Classic 16-piece gold foil Ferrero Rocher chocolate box.',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-cadbury-silk-pack',
    name: 'Cadbury Celebrations Silk Gift Pack',
    category: 'chocolates',
    price: 449,
    stock: 100,
    enabled: true,
    order: 6,
    description: 'Selection of Cadbury Silk Fruit & Nut, Roast Almond, and Mousse bars.',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-belgian-artisan-choc',
    name: 'Handcrafted Belgian Artisan Chocolates',
    category: 'chocolates',
    price: 799,
    stock: 100,
    enabled: true,
    order: 7,
    description: 'Assorted rich Belgian truffles with dark chocolate ganache centers.',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-teddy-giant-4ft',
    name: 'Giant Plush Red Teddy Bear (4 Feet)',
    category: 'teddy',
    price: 1299,
    stock: 100,
    enabled: true,
    order: 8,
    description: '4-foot giant plush crimson teddy bear holding a love heart pillow.',
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-teddy-cuddly-2ft',
    name: 'Cute Cuddly Pink Teddy Bear (2 Feet)',
    category: 'teddy',
    price: 699,
    stock: 100,
    enabled: true,
    order: 9,
    description: 'Adorable 2-foot plush pink teddy bear with ribbon bow.',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-love-greeting-card',
    name: 'Handmade Pop-Up Love Greeting Card',
    category: 'greeting_card',
    price: 199,
    stock: 100,
    enabled: true,
    order: 10,
    description: '3D laser-cut pop-up rose garden card with custom envelope.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-french-rose-perfume',
    name: 'Luxury French Rose Perfume Set (50ml)',
    category: 'perfume',
    price: 1199,
    stock: 100,
    enabled: true,
    order: 11,
    description: 'French floral fragrance with notes of Damascus Rose and Vanilla.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'gb-custom-message',
    name: 'Love Letter in a Vintage Glass Bottle',
    category: 'custom_message',
    price: 299,
    stock: 100,
    enabled: true,
    order: 12,
    description: 'Handwritten parchment message tied with red ribbon inside a corked glass bottle.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'
  }
];

const ValentineGiftBuilder: React.FC<ValentineGiftBuilderProps> = ({ items = [] }) => {
  const activeItems = useMemo(() => {
    return items && items.length > 0 ? items : DEFAULT_GIFT_ITEMS;
  }, [items]);

  const [selectedItems, setSelectedItems] = useState<Record<string, string | null>>({
    flowers: 'gb-heart-100-red-roses',
    chocolates: 'gb-ferrero-heart-24'
  });
  const [expandedCategory, setExpandedCategory] = useState<string | null>('flowers');
  const [customMessage, setCustomMessage] = useState('');
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Group items by category
  const grouped = useMemo(() => {
    const map: Record<string, ValentineGiftBuilderItem[]> = {};
    activeItems.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [activeItems]);

  const categoryOrder = ['flowers', 'chocolates', 'teddy', 'greeting_card', 'photo_frame', 'perfume', 'custom_message'];
  const sortedCategories = categoryOrder.filter(c => grouped[c] && grouped[c].length > 0);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;
    Object.values(selectedItems).forEach(itemId => {
      if (itemId) {
        const item = activeItems.find(i => i.id === itemId);
        if (item) total += item.price;
      }
    });
    return total;
  }, [selectedItems, activeItems]);

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  const toggleItem = useCallback((category: string, itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: prev[category] === itemId ? null : itemId,
    }));
  }, []);

  const handleAddToCart = () => {
    const selectedProducts = Object.entries(selectedItems)
      .filter(([_, itemId]) => itemId !== null)
      .map(([category, itemId]) => {
        const item = activeItems.find(i => i.id === itemId);
        return { category, item };
      })
      .filter(entry => entry.item);

    if (selectedProducts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items selected',
        description: 'Please select at least one item for your custom gift hamper.',
      });
      return;
    }

    const firstImage = selectedProducts.find(p => p.item?.image)?.item?.image || DEFAULT_GIFT_ITEMS[0].image;

    // Add as a single gift bundle with component breakdown
    addToCart({
      _id: `valentine-gift-${Date.now()}`,
      productId: `valentine-gift-${Date.now()}`,
      title: `Custom Valentine Gift Box (${selectedProducts.length} items)`,
      price: totalPrice,
      image: firstImage,
      images: [firstImage],
      quantity: 1,
      isValentineProduct: true,
      productType: 'valentine',
      customizations: {
        isGiftBundle: true,
        title: `Custom Valentine Gift Box (${selectedProducts.length} items)`,
        images: [firstImage],
        giftComponents: selectedProducts.map(({ category, item }) => ({
          category,
          name: item!.name,
          price: item!.price,
        })),
        customMessage: customMessage || undefined,
      },
    });

    toast({
      title: '💝 Custom Gift Box Added to Cart!',
      description: `Your custom Valentine's gift (${selectedProducts.length} items) has been added to your cart successfully.`,
    });
  };

  return (
    <section id="valentine-gift-builder" className="py-12 md:py-20 px-3 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-300 text-xs font-bold tracking-[3px] uppercase mb-3 shadow-sm">
            <Sparkles size={13} className="text-rose-300 animate-pulse" />
            Custom Gift Builder
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white font-serif mb-4 tracking-tight drop-shadow-sm">
            Build Your <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">Surprise Gift</span>
          </h2>
          <p className="text-rose-100/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Mix & match 100/50 Rose Heart Bouquets, Ferrero Rocher Heart Boxes, Cuddly Teddies, and personal notes to craft a magnificent gift hamper.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Category Accordions */}
          <div className="lg:col-span-2 space-y-4">
            {sortedCategories.map((category, catIndex) => {
              const info = categoryLabels[category] || { label: category, icon: '🎁', description: '' };
              const isExpanded = expandedCategory === category;
              const selectedInCategory = selectedItems[category];
              const categoryItems = grouped[category];
              const selectedItemObj = activeItems.find(i => i.id === selectedInCategory);

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: catIndex * 0.05 }}
                  className="rounded-3xl overflow-hidden border border-rose-500/20 bg-rose-950/60 backdrop-blur-xl shadow-xl shadow-black/20"
                >
                  {/* Category Header */}
                  <button
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors text-left"
                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/30 to-pink-600/30 border border-rose-400/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-serif">{info.label}</h3>
                          {selectedItemObj && (
                            <span className="text-xs font-bold text-amber-300">
                              (₹{selectedItemObj.price})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-rose-200/70 line-clamp-1">{info.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedInCategory && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-rose-300">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* Category Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {categoryItems.map(item => {
                            const isSelected = selectedInCategory === item.id;
                            const imgSrc = getImageUrl(item.image);

                            return (
                              <div
                                key={item.id}
                                onClick={() => toggleItem(category, item.id)}
                                className={`relative flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? 'border-2 border-rose-400 bg-rose-900/80 shadow-xl shadow-rose-500/20 scale-[1.02]'
                                    : 'border-white/10 bg-white/5 hover:border-rose-400/40 hover:bg-white/10 shadow-md'
                                }`}
                              >
                                {/* Thumbnail Image */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/15 shadow-md relative">
                                  {imgSrc ? (
                                    <img
                                      src={imgSrc}
                                      alt={item.name}
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-rose-900/50 to-pink-900/50">
                                      {info.icon}
                                    </div>
                                  )}
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
                                      <Check className="w-3 h-3" />
                                    </div>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white leading-tight font-serif mb-1 line-clamp-2">
                                    {item.name}
                                  </p>
                                  {item.description && (
                                    <p className="text-[11px] text-rose-200/70 line-clamp-2 leading-relaxed mb-1.5">
                                      {item.description}
                                    </p>
                                  )}
                                  <span className="text-sm font-black text-amber-300 font-serif">
                                    ₹{item.price}
                                  </span>
                                </div>

                                {/* Select Button */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' : 'border border-white/20 hover:border-rose-400 text-white/50'
                                }`}>
                                  {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Custom Message Input */}
                        {category === 'custom_message' && selectedInCategory && (
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                            <textarea
                              value={customMessage}
                              onChange={(e) => setCustomMessage(e.target.value)}
                              placeholder="Write your personal romantic message here..."
                              rows={3}
                              className="w-full bg-black/40 border border-rose-400/30 rounded-2xl p-3.5 text-sm text-white placeholder-rose-200/40 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none shadow-inner"
                              maxLength={250}
                            />
                            <p className="text-[11px] text-rose-300/60 mt-1 text-right font-medium">
                              {customMessage.length}/250 characters
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-5 sm:p-6 border border-rose-500/20 bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-500 animate-pulse" />
                    <h3 className="text-lg font-bold text-white font-serif">Gift Box Summary</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {selectedCount} Selected
                  </span>
                </div>

                {/* Selected Items List */}
                {selectedCount > 0 ? (
                  <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
                    {Object.entries(selectedItems)
                      .filter(([_, itemId]) => itemId)
                      .map(([category, itemId]) => {
                        const item = activeItems.find(i => i.id === itemId);
                        if (!item) return null;
                        const info = categoryLabels[category];
                        const imgSrc = getImageUrl(item.image);

                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10 shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                                {imgSrc ? (
                                  <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-lg flex items-center justify-center h-full">{info?.icon || '🎁'}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate font-serif">{item.name}</p>
                                <p className="text-[11px] font-bold text-amber-300">₹{item.price}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleItem(category, item.id)}
                              className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                              title="Remove item"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 mb-6 bg-white/5 rounded-2xl border border-dashed border-white/15 p-4">
                    <ShoppingBag className="w-8 h-8 text-rose-300/40 mx-auto mb-2" />
                    <p className="text-xs text-rose-200/60 font-medium">Select bouquets, chocolates, or plush teddies to build your custom hamper</p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-white/10 pt-4 mb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-rose-200/80">Custom Gift Box Total</span>
                    <span className="text-2xl font-black text-amber-300 font-serif">₹{totalPrice}</span>
                  </div>
                  <p className="text-[11px] text-rose-200/60 text-right">Includes free personalized gift wrap & card</p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedCount === 0}
                  className={`w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                    selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add Custom Gift Box (₹{totalPrice})
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValentineGiftBuilder;
