import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, Eye, ShoppingBag, Star, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import { getImageUrl, getThumbnailUrl, getSquareImageUrl } from "@/config";
import ContactModal from "@/components/ui/ContactModal";

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
  const { showContactModal, contactModalProduct, closeContactModal } = useCart();

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

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={closeContactModal}
        productTitle={contactModalProduct}
      />
    </section>
  );
};

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addItem, openCart } = useCart();
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
      const success = addItem({
        id: product._id,
        productId: product._id,
        title: product.title,
        price: product.price,
        originalPrice: product.price,
        image: product.images?.[0] || '/images/placeholder.svg'
      }, 1);
      
      if (success) {
        // Show success toast
        toast.success("Added to cart!", {
          description: `${product.title} has been added to your cart`,
          duration: 3000,
        });
        
        // Open cart sidebar after a short delay
        setTimeout(() => openCart(), 300);
      }
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
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getSquareImageUrl(product.images?.[0], 400, false)}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Try different URL constructions if the first one fails
            if (!target.src.includes('placeholder')) {
              if (product.images?.[0]?.startsWith('/uploads/')) {
                target.src = `https://sbf-backend.onrender.com${product.images[0]}`;
              } else if (product.images?.[0] && !product.images[0].startsWith('http')) {
                target.src = `/images/placeholder.svg`;
              }
            }
          }}
        />
        
        {/* Product Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNewProduct() && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              New
            </span>
          )}
          {isFeaturedProduct() && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistToggle(product._id);
            }}
          >
            <Heart className={cn("w-5 h-5", isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600")} />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(convertPrice(product.price))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-primary/10 hover:bg-primary/20 text-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
          >
            <ShoppingBag className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;