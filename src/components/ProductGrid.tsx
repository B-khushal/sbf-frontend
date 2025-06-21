import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, Eye, ShoppingBag, Star, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import { getImageUrl } from "@/config";

type WishlistItem = {
  id: string;
  title: string;
  image: string;
  price: number;
};

const isWishlistItem = (item: unknown): item is WishlistItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'title' in item &&
    'image' in item &&
    'price' in item &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.image === 'string' &&
    typeof item.price === 'number'
  );
};

const loadWishlist = (): WishlistItem[] => {
  try {
    const wishlistStr = localStorage.getItem("wishlist");
    if (!wishlistStr) return [];
    
    const parsed = JSON.parse(wishlistStr) as unknown[];
    if (!Array.isArray(parsed)) return [];
    
    return parsed.filter(isWishlistItem);
  } catch (error: unknown) {
    console.error("Error loading wishlist:", error);
    return [];
  }
};

export type Product = {
  _id: string;
  title: string;
  price: number;
  discount: number;
  images: string[];
  category: string;
  categories?: string[];
  description?: string;
  createdAt?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
};

type ProductGridProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
};

const ProductGrid = ({ products, title, subtitle, className, loading }: ProductGridProps) => {
  return (
    <section className={cn("py-16 px-6 md:px-8", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3">{title}</h2>}
          {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
          {products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const wishlistStr = localStorage.getItem("wishlist");
      if (wishlistStr) {
        const wishlistItems = JSON.parse(wishlistStr);
        if (Array.isArray(wishlistItems)) {
          return wishlistItems.map(item => item.id);
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
    return [];
  });
  
  const isInWishlist = wishlist.includes(product._id);

  // Handle product click with same-tab navigation
  const handleProductClick = (productId: string) => {
    const productUrl = `/product/${productId}`;
    navigate(productUrl);
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    try {
      addItem({
        id: product._id,
        productId: product._id,
        title: product.title,
        price: product.price,
        originalPrice: product.price,
        image: product.images?.[0] || '/images/placeholder.svg'
      }, 1);
      
      // Show success toast
      toast.success("Added to cart!", {
        description: `${product.title} has been added to your cart`,
        duration: 3000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      console.error("Error adding to cart:", error);
      
      if (errorMessage.includes('log in')) {
        toast.error("Please log in", {
          description: "You need to be logged in to add items to cart",
          duration: 4000,
        });
      } else {
        toast.error("Failed to add to cart", {
          description: errorMessage,
          duration: 3000,
        });
      }
    }
  };

  // Handle wishlist toggle with localStorage persistence
  const handleWishlistToggle = (productId: string) => {
    try {
      // Use the utility function for consistent image URL construction
      const imageUrl = getImageUrl(product.images?.[0]);
      
      // Create wishlist item
      const wishlistItem = {
        id: String(productId),
        title: product.title,
        image: imageUrl,
        price: product.price
      };
      
      // Get existing wishlist
      let existingWishlist = [];
      try {
        const wishlistStr = localStorage.getItem("wishlist");
        existingWishlist = wishlistStr ? JSON.parse(wishlistStr) : [];
        if (!Array.isArray(existingWishlist)) {
          existingWishlist = [];
        }
      } catch (error) {
        console.error("Error parsing wishlist:", error);
        existingWishlist = [];
      }
      
      // Check if already exists
      const isCurrentlyInWishlist = existingWishlist.some(item => item.id === String(productId));
      
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        const updatedWishlist = existingWishlist.filter(item => item.id !== String(productId));
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setWishlist(prev => prev.filter(id => id !== productId));
        
        toast.success("Removed from wishlist", {
          description: "Item has been removed from your wishlist",
          duration: 2000,
        });
      } else {
        // Add to wishlist
        const updatedWishlist = [...existingWishlist, wishlistItem];
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setWishlist(prev => [...prev, productId]);
        
        toast.success("Added to wishlist", {
          description: "Item has been added to your wishlist",
          duration: 2000,
        });
      }
      
      // Trigger storage event for Navigation to update count
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist", {
        description: "Please try again",
        duration: 2000,
      });
    }
  };

  // Determine if product is new (created within last 30 days)
  const isNewProduct = () => {
    if (!product.createdAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(product.createdAt) > thirtyDaysAgo;
  };

  // Determine if product is featured
  const isFeaturedProduct = () => {
    return product.featured || product.isFeatured || product.price > 100 || index < 2;
  };
  
  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
      onClick={() => handleProductClick(product._id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Simple overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Wishlist Button - Always Visible */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product._id);
          }}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 z-10 ${
            isInWishlist 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-700 hover:text-red-500'
          }`}
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={isInWishlist ? 'fill-current' : ''} />
        </button>

        {/* Feature and New Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isFeaturedProduct() && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Star size={12} className="fill-white text-white" />
              <span className="text-xs font-bold">FEATURED</span>
            </div>
          )}
          
          {isNewProduct() && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles size={12} className="text-white" />
              <span className="text-xs font-bold">NEW</span>
            </div>
          )}
          
          {product.discount > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
              <span className="text-xs font-bold">-{product.discount}% OFF</span>
            </div>
          )}
        </div>

        {/* Quick Actions Overlay - Show on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
          <div className="p-4 flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(product._id);
              }}
              className="px-4 py-2 bg-white/90 text-gray-800 rounded-full text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
            >
              <Eye size={14} />
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description || "Beautiful floral arrangement perfect for any occasion"}
          </p>
        </div>
        
        {/* Enhanced Price Display Below Photo */}
        <div className="mb-3">
          {product.discount > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-red-600">
                  {formatPrice(convertPrice(product.price * (1 - product.discount / 100)))}
                </span>
                <span className="text-sm text-gray-500 line-through decoration-red-500 decoration-2">
                  {formatPrice(convertPrice(product.price))}
                </span>
              </div>
              <div className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-1 rounded-full inline-block w-fit">
                Save {formatPrice(convertPrice(product.price * (product.discount / 100)))}
              </div>
            </div>
          ) : (
            <span className="text-xl font-bold text-primary">{formatPrice(convertPrice(product.price))}</span>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {product.category}
          </span>
          <span className="text-xs text-green-600 font-medium">In Stock</span>
        </div>
      </div>

      {/* External Link Indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-500 text-white p-1 rounded-full" style={{ marginRight: '48px' }}>
        <ExternalLink size={12} />
      </div>
    </div>
  );
};

export default ProductGrid;