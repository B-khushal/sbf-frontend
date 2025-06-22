import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, ShoppingBag } from "lucide-react";
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
  
  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
      onClick={() => handleProductClick(product._id)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.svg';
          }}
        />
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white shadow-sm"
            onClick={(e) => handleWishlistToggle(e, product._id)}
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
            onClick={(e) => handleAddToCart(e, product)}
          >
            <ShoppingBag className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;