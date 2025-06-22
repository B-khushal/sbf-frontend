import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useCart from "@/hooks/use-cart";
import { getImageUrl } from "@/config";

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
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const { formatPrice, convertPrice } = useCurrency();
  const { addItem, openCart } = useCart();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<string[]>(() => {
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

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
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
        toast.success("Added to cart!", {
          description: `${product.title} has been added to your cart`,
          duration: 3000,
        });
        setTimeout(() => openCart(), 300);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart", {
        description: "Please try again",
        duration: 3000,
      });
    }
  };

  const handleViewDetails = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    navigate(`/product/${productId}`);
  };

  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    try {
      const wishlistItem = {
        id: String(productId),
        title: product.title,
        image: getImageUrl(product.images?.[0]),
        price: product.price
      };
      
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
      
      const isCurrentlyInWishlist = existingWishlist.some(item => item.id === String(productId));
      
      if (isCurrentlyInWishlist) {
        const updatedWishlist = existingWishlist.filter(item => item.id !== String(productId));
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        const updatedWishlist = [...existingWishlist, wishlistItem];
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setWishlist(prev => [...prev, productId]);
        toast.success("Added to wishlist");
      }
      
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  // Calculate discounted price
  const originalPrice = product.price;
  const discountedPrice = product.discount > 0 ? originalPrice - (originalPrice * product.discount / 100) : originalPrice;
  const hasDiscount = product.discount > 0;
  
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.svg';
          }}
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Wishlist Button - Always visible */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300"
            onClick={(e) => handleWishlistToggle(e, product._id)}
          >
            <Heart className={cn("w-5 h-5 transition-colors", isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500")} />
          </Button>
        </div>

        {/* Hover Actions - Appear on hover */}
        <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <Button
            className="flex-1 bg-white/95 text-gray-900 hover:bg-white shadow-lg backdrop-blur-sm border border-gray-200"
            onClick={(e) => handleViewDetails(e, product._id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
          <Button
            className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-lg"
            onClick={(e) => handleAddToCart(e, product)}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 text-lg">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
        </div>
        
        {/* Price Section */}
        <div className="flex items-center gap-2 mt-3">
          <div className="text-xl font-bold text-gray-900">
            {formatPrice(convertPrice(discountedPrice))}
          </div>
          {hasDiscount && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(convertPrice(originalPrice))}
            </div>
          )}
        </div>

        {/* Rating Stars */}
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm text-gray-500 ml-2">(4.5)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;