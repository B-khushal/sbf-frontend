import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus, ShoppingBag, ChevronRight, ChevronDown, Heart } from 'lucide-react';
import type { ValentineGiftBuilderItem } from '@/types/valentine';
import { getImageUrl } from '@/config';
import useCart from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface ValentineGiftBuilderProps {
  items: ValentineGiftBuilderItem[];
}

const categoryLabels: Record<string, { label: string; icon: string; description: string }> = {
  flowers: { label: 'Flowers', icon: '🌹', description: 'Choose a beautiful bouquet' },
  chocolates: { label: 'Chocolates', icon: '🍫', description: 'Add something sweet' },
  teddy: { label: 'Teddy Bear', icon: '🧸', description: 'Gift a cuddly companion' },
  greeting_card: { label: 'Greeting Card', icon: '💌', description: 'Express with words' },
  photo_frame: { label: 'Photo Frame', icon: '🖼️', description: 'Frame your memories' },
  perfume: { label: 'Perfume', icon: '🌸', description: 'A fragrant surprise' },
  custom_message: { label: 'Custom Message', icon: '✍️', description: 'Add a personal touch' },
};

const ValentineGiftBuilder: React.FC<ValentineGiftBuilderProps> = ({ items }) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, string | null>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>('flowers');
  const [customMessage, setCustomMessage] = useState('');
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Group items by category
  const grouped = useMemo(() => {
    const map: Record<string, ValentineGiftBuilderItem[]> = {};
    items.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [items]);

  const categoryOrder = ['flowers', 'chocolates', 'teddy', 'greeting_card', 'photo_frame', 'perfume', 'custom_message'];
  const sortedCategories = categoryOrder.filter(c => grouped[c] && grouped[c].length > 0);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;
    Object.values(selectedItems).forEach(itemId => {
      if (itemId) {
        const item = items.find(i => i.id === itemId);
        if (item) total += item.price;
      }
    });
    return total;
  }, [selectedItems, items]);

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
        const item = items.find(i => i.id === itemId);
        return { category, item };
      })
      .filter(entry => entry.item);

    if (selectedProducts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items selected',
        description: 'Please select at least one item for your gift.',
      });
      return;
    }

    // Add as a single gift bundle with component breakdown
    addToCart({
      _id: `valentine-gift-${Date.now()}`,
      productId: `valentine-gift-${Date.now()}`,
      title: `Valentine's Surprise Gift (${selectedProducts.length} items)`,
      price: totalPrice,
      images: [],
      quantity: 1,
      isValentineProduct: true,
      productType: 'valentine',
      customizations: {
        isGiftBundle: true,
        title: `Valentine's Surprise Gift (${selectedProducts.length} items)`,
        images: [],
        giftComponents: selectedProducts.map(({ category, item }) => ({
          category,
          name: item!.name,
          price: item!.price,
        })),
        customMessage: customMessage || undefined,
      },
    });

    toast({
      title: '💝 Gift added to cart!',
      description: `Your custom Valentine's gift has been added.`,
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section id="valentine-gift-builder" className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm uppercase tracking-[4px] text-rose-300/70 font-medium mb-3">
            Customize
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] mb-4">
            Build Your <span className="valentine-gradient-text">Surprise Gift</span>
          </h2>
          <p className="text-rose-200/60 text-base md:text-lg max-w-2xl mx-auto">
            Mix & match items to create the perfect personalized Valentine's gift.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Category Accordions */}
          <div className="lg:col-span-2 space-y-3">
            {sortedCategories.map((category, catIndex) => {
              const info = categoryLabels[category] || { label: category, icon: '🎁', description: '' };
              const isExpanded = expandedCategory === category;
              const selectedInCategory = selectedItems[category];
              const categoryItems = grouped[category];

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: catIndex * 0.06 }}
                  className="valentine-glass-dark rounded-2xl overflow-hidden border border-rose-500/10"
                >
                  {/* Category Header */}
                  <button
                    className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div className="text-left">
                        <h3 className="text-base font-semibold text-white">{info.label}</h3>
                        <p className="text-xs text-rose-300/50">{info.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedInCategory && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-rose-300/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 md:px-5 md:pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {categoryItems.map(item => {
                            const isSelected = selectedInCategory === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => toggleItem(category, item.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                  isSelected
                                    ? 'border-rose-400/50 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                                    : 'border-white/5 bg-white/3 hover:border-rose-400/20 hover:bg-white/5'
                                }`}
                              >
                                {item.image ? (
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-xl">
                                    {info.icon}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                  <p className="text-sm font-bold text-rose-300">₹{item.price}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected ? 'bg-rose-500 text-white' : 'border border-white/20'
                                }`}>
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Message Input */}
                        {category === 'custom_message' && selectedInCategory && (
                          <div className="px-4 pb-4 md:px-5 md:pb-5">
                            <textarea
                              value={customMessage}
                              onChange={(e) => setCustomMessage(e.target.value)}
                              placeholder="Write your love message here..."
                              rows={3}
                              className="w-full bg-white/5 border border-rose-400/20 rounded-xl p-3 text-sm text-white placeholder-rose-300/30 focus:outline-none focus:border-rose-400/50 resize-none"
                              maxLength={200}
                            />
                            <p className="text-[10px] text-rose-300/30 mt-1 text-right">
                              {customMessage.length}/200
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
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="valentine-glass-dark rounded-2xl p-5 md:p-6 border border-rose-500/10"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Heart className="w-5 h-5 text-rose-400" fill="currentColor" />
                  <h3 className="text-lg font-bold text-white font-['Playfair_Display']">Gift Summary</h3>
                </div>

                {/* Selected Items List (Expandable) */}
                {selectedCount > 0 ? (
                  <div className="space-y-2 mb-5">
                    {Object.entries(selectedItems)
                      .filter(([_, itemId]) => itemId)
                      .map(([category, itemId]) => {
                        const item = items.find(i => i.id === itemId);
                        if (!item) return null;
                        const info = categoryLabels[category];
                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white/5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base">{info?.icon || '🎁'}</span>
                              <span className="text-sm text-white truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-semibold text-rose-300">₹{item.price}</span>
                              <button
                                onClick={() => toggleItem(category, item.id)}
                                className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-rose-300 hover:bg-rose-500/20 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-6 mb-5">
                    <p className="text-sm text-rose-300/40">Select items to build your gift</p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-white/10 pt-4 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-200/60">Total ({selectedCount} items)</span>
                    <span className="text-2xl font-bold valentine-gradient-text">₹{totalPrice}</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedCount === 0}
                  className={`w-full valentine-btn-primary flex items-center justify-center gap-2 ${
                    selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add Gift to Cart
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
