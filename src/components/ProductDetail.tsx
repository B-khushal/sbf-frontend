import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight, Star, Eye, ShoppingBag, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import { getImageUrl, getProductImageUrl } from '@/config';
import ContactModal from '@/components/ui/ContactModal';
import { CustomizeProductModal } from '@/components/ui/CustomizeProductModal';
import useCart from '@/hooks/use-cart';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import productService, { ProductData } from '@/services/productService';
import ProductReviews from '@/components/ProductReviews';

type AddonOption = {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
};

type CustomizationOptions = {
  allowPhotoUpload: boolean;
  allowNumberInput: boolean;
  numberInputLabel: string;
  allowMessageCard: boolean;
  messageCardPrice: number;
  addons: {
    flowers: AddonOption[];
    chocolates: AddonOption[];
  };
  previewImage: string;
};

type CustomizationData = {
  photo?: string;
  number?: string;
  messageCard?: string;
  selectedFlowers: AddonOption[];
  selectedChocolates: AddonOption[];
};

type ProductDetailProps = {
  product: {
    _id: string;
    title: string;
    price: number;
    discount: number;
    images: string[];
    description: string;
    details: string[];
    careInstructions?: string[];
    category: string;
    isNewArrival?: boolean;
    isFeatured?: boolean;
    isCustomizable?: boolean;
    customizationOptions?: CustomizationOptions;
  };
  onAddToCart: (item: {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
    customizations?: CustomizationData;
  }) => void;
  onReviewSubmit: () => void;
};

// Recommended Products Component
const RecommendedProducts: React.FC<{ productId: string; category: string }> = ({ productId, category }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, convertPrice } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getRecommendedProducts(productId, category, 6);
        setRecommendedProducts(products);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
        toast({
          title: "Error",
          description: "Failed to load recommended products",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [productId, category]);

  const handleProductClick = (product: ProductData) => {
    // Open product in new tab for better optimization
    window.open(`/product/${product._id}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Recommended Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendedProducts.length) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6 text-center">Recommended Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendedProducts.map((product) => {
          const discountedPrice = product.discount 
            ? product.price * (1 - product.discount / 100)
            : product.price;

          return (
            <div
              key={product._id}
              onClick={() => handleProductClick(product)}
              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    -{product.discount}%
                  </div>
                )}
                {product.isNewArrival && (
                  <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    NEW
                  </div>
                )}
                <img
                  src={getImageUrl(product.images[0]) || '/images/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                
                {/* Price */}
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(convertPrice(discountedPrice))}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-gray-500 line-through">
                      {formatPrice(convertPrice(product.price))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProductDetail = ({ product, onAddToCart, onReviewSubmit }: ProductDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizations, setCustomizations] = useState<CustomizationData | undefined>();
  const customizeModalRef = useRef<HTMLDivElement>(null);

  // Debug log to check properties
  console.log(`Product Detail ${product.title}:`, {
    isNewArrival: product.isNewArrival,
    isFeatured: product.isFeatured,
    discount: product.discount
  });

  // Calculate prices in base currency (INR)
  const originalPrice = product.price;
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : originalPrice;

  // Handle image URL using utility function with optimization for product detail view
  const imageUrl = getProductImageUrl(product.images[selectedImage], 800, false); 

  // Image Navigation
  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const incrementQuantity = () => {
    if (quantity >= 5) {
      toast({
        title: "Quantity Limit Reached",
        description: "Maximum 5 items allowed per product. Contact us for bulk orders.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    setQuantity((prev) => prev + 1);
  };
  
  const decrementQuantity = () => quantity > 1 && setQuantity((prev) => prev - 1);

  const handleCustomize = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to customize products",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    setIsCustomizeModalOpen(true);
    setTimeout(() => {
      if (customizeModalRef.current) {
        customizeModalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); // Delay to ensure modal is rendered
  };

  const handleAddToCart = () => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    try {
      const cartItem = {
        _id: product._id,
        id: product._id,
        productId: product._id,
        title: product.title,
        price: discountedPrice,
        originalPrice: originalPrice,
        image: imageUrl,
        quantity: quantity,
        category: product.category,
        discount: product.discount,
        images: product.images,
        description: product.description,
        details: product.details,
        careInstructions: product.careInstructions,
        isNewArrival: product.isNewArrival,
        isFeatured: product.isFeatured,
        customizations: customizations
      };
      
      addToCart(cartItem);
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.title} added to your cart`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      
      if (errorMessage.includes('log in')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to cart",
          variant: "destructive",
          duration: 4000,
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 4000,
        });
      }
    }
  };

  const handleAddToWishlist = () => {
    try {
      // Use utility function for consistent image URL construction
      const imageUrl = getImageUrl(product.images?.[0], { bustCache: true });
      
      // Create wishlist item with proper ID
      const wishlistItem = {
        id: String(product._id),
        title: product.title,
        image: imageUrl,
        price: product.price
      };
      
      console.log("Adding to wishlist from ProductDetail:", wishlistItem);
      
      // Get existing wishlist with error handling
      let existingWishlist = [];
      try {
        const wishlistStr = localStorage.getItem("wishlist");
        existingWishlist = wishlistStr ? JSON.parse(wishlistStr) : [];
        if (!Array.isArray(existingWishlist)) {
          console.error("Wishlist is not an array, resetting");
          existingWishlist = [];
        }
      } catch (error) {
        console.error("Error parsing wishlist:", error);
        existingWishlist = [];
      }
      
      // Check if already exists
      if (existingWishlist.some(item => item.id === String(product._id))) {
        toast({
          title: "Already in wishlist",
          description: "This product is already in your wishlist",
          duration: 3000,
        });
        return;
      }
      
      // Add new item and save directly
      const updatedWishlist = [...existingWishlist, wishlistItem];
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      
      // Trigger storage event for Navigation to update count
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Added to wishlist",
        description: `${product.title} has been added to your wishlist`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.title} - SBF Florist`,
      text: `Check out this beautiful ${product.title} from SBF Florist! ${formatPrice(convertPrice(discountedPrice))}`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Product shared successfully!",
          duration: 3000,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Final fallback: Copy URL only
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard!",
          duration: 3000,
        });
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        toast({
          title: "Error",
          description: "Failed to share or copy link",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  return (
    <section className="pt-12 sm:pt-16 pb-16 px-6 md:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Images */}
          <div className="relative space-y-4">
            <div className="relative pb-[125%] bg-secondary/20 overflow-hidden rounded-lg shadow-md">
              <img
                src={imageUrl}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-smooth rounded-lg"
              />

              {/* Badges for new and featured products */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {(product.isNewArrival || (product as {isNew?: boolean}).isNew) && (
                  <span className="bg-primary text-white text-sm px-3 py-1 rounded-md font-medium">
                    New
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-amber-500 text-white text-sm px-3 py-1 rounded-md font-medium">
                    Featured
                  </span>
                )}
              </div>
              
              {product.discount > 0 && (
                <span className="absolute bottom-3 right-3 bg-red-500 text-white text-sm px-3 py-1 rounded-md font-medium">
                  {product.discount}% Off
                </span>
              )}

              {/* Navigation Arrows - Only show if there are multiple images */}
              {product.images.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery - Only show if there are multiple images */}
            {product.images.length > 1 && (
              <div className="flex gap-3 justify-center">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-16 h-20 relative overflow-hidden rounded-md shadow-md transition-all duration-300 ease-smooth",
                      selectedImage === index
                        ? "ring-2 ring-primary ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={getImageUrl(image, { bustCache: false })}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="pb-6 mb-6 border-b">
              <div className="text-sm text-muted-foreground mb-2">{product.category}</div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{product.title}</h1>

              {/* Pricing with Discounted Price */}
              <div className="text-xl font-semibold mb-6">
                <span className="text-primary font-bold">{formatPrice(convertPrice(discountedPrice))}</span>
                {product.discount && (
                  <span className="text-muted-foreground line-through ml-2">
                    {formatPrice(convertPrice(originalPrice))}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="text-sm mr-4">Quantity</span>
                <div className="flex items-center h-10 border rounded-md overflow-hidden shadow-md">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors duration-200 disabled:opacity-50 rounded-md"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors duration-200 rounded-md"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {product.isCustomizable ? (
                  <>
                    <Button
                      className="flex-1"
                      onClick={handleCustomize}
                      variant="outline"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Customize
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={!customizations}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
                <button
                  onClick={handleAddToWishlist}
                  className="h-12 px-6 border border-muted flex items-center justify-center gap-2 rounded-md hover:bg-secondary transition-colors duration-300"
                >
                  <Heart size={18} />
                  <span className="hidden sm:inline">Wishlist</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="h-12 px-6 border border-muted flex items-center justify-center gap-2 rounded-md hover:bg-secondary transition-colors duration-300"
                  title="Share this product"
                >
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 text-blue-700 flex items-center gap-2">
                📋 Product Details
              </h3>
              <div className="space-y-3">
                {product.details.map((detail, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 text-sm">🔸</span>
                      <p className="text-blue-800 text-sm font-medium">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Instructions */}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 text-green-700 flex items-center gap-2">
                  🌿 Care Instructions
                </h3>
                <div className="space-y-3">
                  {product.careInstructions.map((instruction, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 text-sm">💡</span>
                        <p className="text-green-800 text-sm font-medium">{instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Reviews Section */}
        <ProductReviews productId={product._id} onReviewSubmit={onReviewSubmit} />
        
        {/* Recommended Products Section */}
        <RecommendedProducts productId={product._id} category={product.category} />
      </div>
      
      {/* Customization Modal */}
      {product.isCustomizable && product.customizationOptions && (
        <div ref={customizeModalRef}>
          <CustomizeProductModal
            open={isCustomizeModalOpen}
            onClose={() => setIsCustomizeModalOpen(false)}
            product={{
              _id: product._id,
              title: product.title,
              price: discountedPrice,
              images: product.images,
              customizationOptions: product.customizationOptions
            }}
            onAddToCart={(customizations, customTotalPrice) => {
              setCustomizations(customizations);
              setIsCustomizeModalOpen(false);
              // Use the customTotalPrice for the cart item
              const cartItem = {
                _id: product._id,
                id: product._id,
                productId: product._id,
                title: product.title,
                price: customTotalPrice,
                originalPrice: originalPrice,
                image: imageUrl,
                quantity: quantity,
                category: product.category,
                discount: product.discount,
                images: product.images,
                description: product.description,
                details: product.details,
                careInstructions: product.careInstructions,
                isNewArrival: product.isNewArrival,
                isFeatured: product.isFeatured,
                customizations: customizations
              };
              addToCart(cartItem);
              toast({
                title: "Added to cart",
                description: `${quantity} × ${product.title} added to your cart`,
                duration: 3000,
              });
            }}
          />
        </div>
      )}

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        productTitle={product.title}
      />
    </section>
  );
};

export default ProductDetail;
