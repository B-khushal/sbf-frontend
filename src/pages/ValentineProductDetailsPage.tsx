import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Calendar, MessageSquare, ShieldAlert, Sparkles, Check, Gift } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { useValentine } from '@/contexts/ValentineContext';
import useCart from '@/hooks/use-cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { trackProductView } from '@/services/activityService';

import FloatingPetals from '@/components/valentine/FloatingPetals';
import '@/components/valentine/valentine.css';

import type { ValentineProduct } from '@/types/valentine';

const ValentineProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isValentineEnabled, settings, loading: contextLoading } = useValentine();
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<ValentineProduct | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  // Selected Options
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loveNote, setLoveNote] = useState<string>('');
  const [anonymousGift, setAnonymousGift] = useState<boolean>(false);
  const [surpriseDelivery, setSurpriseDelivery] = useState<boolean>(false);
  const [greetingCard, setGreetingCard] = useState<string>('none');
  const [customPhoto, setCustomPhoto] = useState<string>('');

  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setProductLoading(true);
        const response = await api.get(`/products/${id}`);
        const data = response.data;
        
        // Block regular products from this page
        if (data.productType === 'regular' && !data.isValentineProduct) {
          navigate('/shop');
          return;
        }

        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        } else if (data.image) {
          setActiveImage(data.image);
        }

        // Set default selected date if available
        if (data.availableDates && data.availableDates.length > 0) {
          setSelectedDate(data.availableDates[0]);
        }
      } catch (err) {
        console.error('Error fetching Valentine product details:', err);
        navigate('/valentine-shop');
      } finally {
        setProductLoading(false);
      }
    };

    if (id && isValentineEnabled) {
      fetchProductDetails();
    }
  }, [id, isValentineEnabled, navigate]);

  useEffect(() => {
    if (product?._id) {
      void trackProductView(
        product._id,
        product.title,
        `/valentine-product/${product._id}`
      );
    }
  }, [product]);

  // Compute Active Price based on selected delivery date
  const activePrice = useMemo(() => {
    if (!product) return 0;
    if (selectedDate && product.dateWisePricing) {
      // Mongoose Map fields are serialized as objects in JSON
      const pricingObj = product.dateWisePricing as Record<string, number>;
      const override = pricingObj[selectedDate] ?? pricingObj[selectedDate.toLowerCase()] ?? pricingObj[selectedDate.replace(' Feb', ' February')];
      if (override !== undefined && override !== null) {
        return override;
      }
    }
    return product.price;
  }, [product, selectedDate]);

  // Compute Stock state for selected date
  const isSoldOutForDate = useMemo(() => {
    if (!product || !selectedDate) return false;
    if (product.dateWiseStock) {
      const stockObj = product.dateWiseStock as Record<string, number>;
      const stockForDate = stockObj[selectedDate] ?? stockObj[selectedDate.toLowerCase()];
      if (stockForDate !== undefined && stockForDate !== null) {
        return stockForDate <= 0;
      }
    }
    return product.countInStock <= 0;
  }, [product, selectedDate]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.availableDates && product.availableDates.length > 0 && !selectedDate) {
      toast({
        title: 'Select Delivery Date',
        description: 'Please pick an available Valentine delivery date before adding to cart.',
        variant: 'destructive',
      });
      return;
    }

    if (isSoldOutForDate) {
      toast({
        title: 'Sold Out',
        description: 'This gift is sold out for your selected delivery date. Please choose another date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAddingToCart(true);

      const customizations = {
        deliveryDate: selectedDate,
        loveNote: loveNote.trim() || undefined,
        anonymousGift,
        surpriseDelivery,
        greetingCard: greetingCard !== 'none' ? greetingCard : undefined,
        customPhoto: customPhoto || undefined,
        selectedCampaign: "Valentine's Week",
        deliveryRestrictions: "Valentine Week delivery dates are reserved exclusively for Valentine's Special products."
      };

      const cartItem = {
        _id: product._id,
        id: product._id,
        productId: product._id,
        title: product.title,
        price: activePrice,
        originalPrice: product.price,
        image: product.images?.[0] || product.image || '',
        images: product.images || [],
        quantity: 1,
        category: product.category || '',
        discount: product.discount || 0,
        description: product.description || '',
        careInstructions: product.careInstructions || [],
        isNewArrival: Boolean(product.isNewArrival),
        isFeatured: Boolean(product.isFeatured),
        productType: 'valentine' as const,
        isValentineProduct: true,
        availableDates: product.availableDates || [],
        customizations,
      };

      await addToCart(cartItem);
      
      toast({
        title: 'Added to Cart ❤️',
        description: `${product.title} has been added for ${selectedDate}.`,
      });

      setTimeout(() => {
        navigate('/cart');
      }, 500);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Master Switch Redirect
  if (!contextLoading && !isValentineEnabled) {
    navigate('/shop');
    return null;
  }

  if (contextLoading || productLoading) {
    return (
      <div className="min-h-screen bg-[#2e040f] flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4 valentine-heart-pulse" />
          <p className="text-rose-200/70 text-lg">Drawing up details with love...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#2e040f] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-rose-300 mb-4 font-semibold text-lg">Gift not found</p>
          <button onClick={() => navigate('/valentine-shop')} className="valentine-btn-primary px-6 py-2">
            Back to Valentine Shop
          </button>
        </div>
      </div>
    );
  }

  const GREETING_CARDS = [
    { id: 'none', label: 'No Card' },
    { id: 'classic-love', label: 'Classic Red Love Card (₹49)' },
    { id: 'floral-romance', label: 'Luxury Floral Greeting Card (₹79)' },
    { id: 'heart-popout', label: '3D Pop-Up Heart Card (₹129)' },
  ];

  return (
    <>
      <Helmet>
        <title>{product.title} | Exclusive Valentine's Gift</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-[#24030c] text-white relative overflow-hidden pb-24">
        {/* Floating Petals */}
        <FloatingPetals enabled={settings?.theme?.floatingPetals ?? true} count={16} />

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-rose-800/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-pink-700/8 rounded-full blur-[80px] pointer-events-none" />

        {/* BACK TO SHOP BAR */}
        <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-10 relative z-10">
          <button
            onClick={() => navigate('/valentine-shop')}
            className="inline-flex items-center gap-2 text-rose-300/80 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Valentine Collection
          </button>
        </div>

        {/* MAIN DETAIL GRID */}
        <div className="max-w-6xl mx-auto px-4 mt-6 grid md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
          {/* LEFT: PREMIUM GALLERY */}
          <div className="space-y-4">
            <motion.div
              layoutId={`product-img-${product._id}`}
              className="aspect-square rounded-3xl overflow-hidden border border-rose-950 bg-rose-950/20 shadow-2xl relative"
            >
              <img
                src={activeImage || '/images/placeholder.jpg'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md border border-rose-500/20 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-xl">
                ❤️ Handcrafted Premium Arrangement
              </div>
            </motion.div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === img ? 'border-rose-500 scale-95 shadow-md shadow-rose-950/50' : 'border-rose-950 hover:border-rose-800'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS & DATE SELECTION & GIFT CONFIGURATION */}
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase mb-3">
                <Sparkles className="w-3 h-3" />
                Valentine Special Exclusive
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-2 font-['Playfair_Display'] tracking-tight">
                {product.title}
              </h1>
              <p className="text-rose-400 font-medium text-xs tracking-wider uppercase">
                {product.valentineCategory || product.category}
              </p>
            </div>

            {/* Pricing Section (updates automatically) */}
            <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-950 flex justify-between items-center gap-4">
              <div>
                <p className="text-xs text-rose-200/50 font-medium uppercase mb-1">Delivered Price</p>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-rose-300 font-mono">
                    {formatPrice(convertPrice(activePrice))}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-sm text-rose-200/40 line-through font-mono">
                      {formatPrice(convertPrice(product.price * (1 + product.discount/100)))}
                    </span>
                  )}
                </div>
              </div>
              {product.discount > 0 && (
                <div className="bg-rose-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-xl shadow-lg shadow-rose-950/20">
                  Save {product.discount}%
                </div>
              )}
            </div>

            {/* Date Availability Section */}
            {product.availableDates && product.availableDates.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-rose-300/80 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  Select Gifting Delivery Date
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {product.availableDates.map((dateStr) => {
                    const isSel = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`py-2 px-3 text-[11px] rounded-2xl border text-center transition-all duration-200 font-medium ${
                          isSel
                            ? 'bg-rose-500/25 border-rose-500 text-rose-300 font-bold shadow-lg shadow-rose-950/20 scale-[1.02]'
                            : 'bg-rose-950/20 border-rose-950/60 hover:bg-rose-950/40 hover:border-rose-900 text-rose-200/70'
                        }`}
                      >
                        {dateStr}
                      </button>
                    );
                  })}
                </div>
                {isSoldOutForDate ? (
                  <p className="text-xs text-rose-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Sold Out For Selected Date! Please select another date.
                  </p>
                ) : (
                  <p className="text-[10px] text-rose-200/40 leading-snug flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-rose-400" />
                    Delivery availability and pricing verified for {selectedDate}.
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-rose-300/80 tracking-wider">Arrangement Description</h3>
              <p className="text-rose-200/70 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Customizations Section */}
            <div className="space-y-4 pt-4 border-t border-rose-950/40">
              <h3 className="text-xs font-bold uppercase text-rose-300/80 tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-rose-400" />
                Premium Romantic Upgrades
              </h3>

              {/* Love Note */}
              <div className="space-y-1.5">
                <label className="text-xs text-rose-200/60 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Love Note / Greeting Message
                </label>
                <textarea
                  value={loveNote}
                  onChange={(e) => setLoveNote(e.target.value)}
                  placeholder="Write a sweet message to your loved one here..."
                  className="w-full bg-[#1b0209]/80 border border-rose-950 rounded-2xl p-3 text-sm text-rose-100 placeholder-rose-200/20 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 h-20 resize-none"
                />
              </div>

              {/* Card Option */}
              <div className="space-y-1.5">
                <label className="text-xs text-rose-200/60">Greeting Card upgrade</label>
                <select
                  value={greetingCard}
                  onChange={(e) => setGreetingCard(e.target.value)}
                  className="w-full bg-[#1b0209]/80 border border-rose-950 rounded-2xl px-3 py-2.5 text-xs text-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {GREETING_CARDS.map(card => (
                    <option key={card.id} value={card.id}>{card.label}</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload Mock/Link */}
              {product.isCustomizable && product.customizationOptions?.allowPhotoUpload && (
                <div className="space-y-1.5">
                  <label className="text-xs text-rose-200/60">Upload Custom Couple Photo (optional)</label>
                  <input
                    type="text"
                    value={customPhoto}
                    onChange={(e) => setCustomPhoto(e.target.value)}
                    placeholder="Enter image URL to print on card/box"
                    className="w-full bg-[#1b0209]/80 border border-rose-950 rounded-2xl px-3 py-2 text-xs text-rose-200 placeholder-rose-200/20 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-xs select-none transition-all duration-200 ${
                  surpriseDelivery 
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
                    : 'bg-rose-950/10 border-rose-950/50 hover:bg-rose-950/20 hover:border-rose-900 text-rose-200/60'
                }`}>
                  <span>Surprise Delivery</span>
                  <input
                    type="checkbox"
                    checked={surpriseDelivery}
                    onChange={(e) => setSurpriseDelivery(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    surpriseDelivery ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-950/80 bg-[#1b0209]'
                  }`}>
                    {surpriseDelivery && <Check className="w-2.5 h-2.5" />}
                  </div>
                </label>

                <label className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-xs select-none transition-all duration-200 ${
                  anonymousGift 
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
                    : 'bg-rose-950/10 border-rose-950/50 hover:bg-rose-950/20 hover:border-rose-900 text-rose-200/60'
                }`}>
                  <span>Anonymous Sender</span>
                  <input
                    type="checkbox"
                    checked={anonymousGift}
                    onChange={(e) => setAnonymousGift(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    anonymousGift ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-950/80 bg-[#1b0209]'
                  }`}>
                    {anonymousGift && <Check className="w-2.5 h-2.5" />}
                  </div>
                </label>
              </div>
            </div>

            {/* Add to Cart button */}
            <div className="pt-4 border-t border-rose-950/40">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isSoldOutForDate}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-950/40 disabled:text-rose-200/20 text-white font-extrabold text-sm shadow-xl shadow-rose-950/40 flex items-center justify-center gap-2.5 transition-colors"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
                {addingToCart ? 'Sending message to cart...' : isSoldOutForDate ? 'Sold Out For Selected Date' : 'Pre-order Valentine Gift'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ValentineProductDetailsPage;
