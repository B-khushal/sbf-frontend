import React, { useState } from 'react';
import { ShoppingBag, Heart, Star, X, Check, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import useCart from '@/hooks/use-cart';
import useWishlist from '@/hooks/use-wishlist';
import { getImageUrl } from '@/config';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ProtectedImage from './ProtectedImage';

import { Product } from '../ProductGrid';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: any, quantity: number) => boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const isInWishlist = wishlistItems.some(item => item.id === product._id);
  const discountedPrice = product.discount > 0
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login first to manage your wishlist");
      navigate('/login');
      return;
    }
    
    try {
      const wishlistItem = {
        id: String(product._id),
        title: product.title,
        image: product.images?.[0] || '/images/placeholder.svg',
        price: product.price
      };

      if (isInWishlist) {
        await removeFromWishlist(String(product._id));
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(wishlistItem);
        toast.success("Added to wishlist");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login first to add items to your cart");
      navigate('/login', { state: { redirect: window.location.pathname } });
      return;
    }

    try {
      const addToCartFunction = onAddToCart || addToCart;
      const cartItem = {
        _id: product._id,
        title: product.title,
        price: Math.round(discountedPrice),
        images: product.images || [],
        quantity: 1,
        discount: product.discount || 0,
        category: product.category,
        description: product.description,
      };

      addToCartFunction(cartItem, 1);
      toast.success("🛒 Added to cart!", {
        description: `${product.title} has been added to your cart`,
        duration: 2000,
      });
      onClose();
      setTimeout(() => {
        navigate('/cart');
      }, 800);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl rounded-2xl overflow-hidden p-0 bg-white shadow-2xl border-0">
        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-visible">
          {/* Close button handled by Dialog, but we can customize or let it be */}
          
          {/* Images Section */}
          <div className="w-full md:w-1/2 bg-gray-50 flex flex-col justify-between p-4 md:p-6 border-r border-gray-100">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm flex-1 flex items-center justify-center">
              <ProtectedImage
                src={getImageUrl(product.images?.[activeImageIndex]) || '/images/placeholder.svg'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  -{product.discount}% OFF
                </span>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "w-14 h-14 rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all shadow-sm",
                      activeImageIndex === idx ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <ProtectedImage src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2.5 leading-tight">
                  {product.title}
                </h2>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">
                  {formatPrice(convertPrice(discountedPrice))}
                </span>
                {product.discount > 0 && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(convertPrice(product.price))}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto">
                  {product.description || "Fresh and premium flowers arranged beautifully to convey your heartfelt emotions. Handcrafted with love and care by our expert florists."}
                </p>
              </div>

              {/* Tag features */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl">
                  <span className="text-base">🚀</span>
                  Same-Day Delivery
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl">
                  <span className="text-base">🌸</span>
                  Freshness Guaranteed
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex gap-3">
                {/* Add to Cart Button */}
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white hover:bg-primary/95 hover:shadow-lg transition-all h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </Button>
                
                {/* Wishlist Button */}
                <Button
                  onClick={handleWishlistToggle}
                  variant="outline"
                  className={cn(
                    "w-12 h-12 p-0 rounded-xl border-2 transition-all flex items-center justify-center",
                    isInWishlist ? "border-red-100 bg-red-50 text-red-500" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <Heart size={20} className={isInWishlist ? "fill-current" : ""} />
                </Button>
              </div>
              
              <button 
                onClick={() => {
                  onClose();
                  window.open(`/product/${product._id}`, '_blank');
                }}
                className="w-full text-center text-xs font-semibold text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                View full product details
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
