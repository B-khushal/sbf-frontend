import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ValentineProduct } from '@/types/valentine';
import { getImageUrl } from '@/config';
import useCart from '@/hooks/use-cart';

interface ValentineProductGridProps {
  products: ValentineProduct[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showBadges?: boolean;
}

const ValentineProductGrid: React.FC<ValentineProductGridProps> = ({
  products,
  title = "Valentine's Collection",
  subtitle = 'Handpicked with love for your special someone',
  loading = false,
  showBadges = true,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (product: ValentineProduct) => {
    addToCart({
      _id: product._id,
      title: product.title,
      price: product.price,
      images: product.images,
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-8 max-w-7xl mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="valentine-glass-dark rounded-2xl p-3 animate-pulse">
            <div className="aspect-square bg-white/5 rounded-xl mb-3" />
            <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section id="valentine-products" className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm uppercase tracking-[4px] text-rose-300/70 font-medium mb-3">
            Exclusive
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] mb-4">
            {title}
          </h2>
          <p className="text-rose-200/60 text-base md:text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => {
            const discountedPrice = product.discount > 0
              ? Math.round(product.price * (1 - product.discount / 100))
              : product.price;

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="valentine-product-card valentine-glass-dark group"
              >
                {/* Image */}
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/valentine-product/${product._id}`)}
                >
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  {showBadges && (
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.discount > 0 && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-rose-500 text-white shadow-lg">
                          {product.discount}% OFF
                        </span>
                      )}
                      {product.isValentineExclusive && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5" fill="currentColor" /> Exclusive
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-600 hover:scale-110 shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                  <h3
                    className="text-sm md:text-base font-semibold text-white mb-1 line-clamp-2 cursor-pointer hover:text-rose-300 transition-colors"
                    onClick={() => navigate(`/valentine-product/${product._id}`)}
                  >
                    {product.title}
                  </h3>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-rose-200/60">
                        {product.rating.toFixed(1)} ({product.numReviews})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg font-bold text-white">
                      ₹{discountedPrice}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs text-rose-300/50 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValentineProductGrid;
