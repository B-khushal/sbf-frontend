import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/use-auth';
import { getImageUrl, getProductImageUrl } from '@/config';
import ContactModal from '@/components/ui/ContactModal';
import useCart from '@/hooks/use-cart';
import productService from '@/services/productService';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type Review = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
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
    reviews: Review[];
    rating: number;
    numReviews: number;
  };
  onAddToCart: (item: {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
  }) => void;
  onReviewSubmit: () => void;
};

const ProductDetail = ({ product, onAddToCart, onReviewSubmit }: ProductDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  const { user } = useAuth();
  const { showContactModal, contactModalProduct, closeContactModal } = useCart();

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
      onAddToCart({
        id: product._id,
        productId: product._id,
        title: product.title,
        price: discountedPrice,
        originalPrice: originalPrice,
        image: imageUrl,
        quantity
      });
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
          duration: 3000,
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
        toast({
          title: "Share failed",
          description: "Unable to share or copy link. Please copy the URL manually.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Review submission started:', { 
      rating, 
      comment: comment.length, 
      productId: product._id,
      userLoggedIn: !!user 
    });
    
    if (!user) {
      console.log('❌ No user found');
      toast({
        title: "Please log in",
        description: "You need to be logged in to write a review.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ User is logged in:', user.name, 'User ID:', user._id);

    if (rating === 0) {
      console.log('❌ No rating selected');
      toast({
        title: "Rating required",
        description: "Please select a rating (1-5 stars).",
        variant: "destructive"
      });
      return;
    }

    if (comment.trim() === '') {
      console.log('❌ No comment provided');
      toast({
        title: "Comment required",
        description: "Please write a comment about the product.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Rating and comment are valid:', { rating, commentLength: comment.trim().length });

    setIsSubmitting(true);
    try {
      console.log('📡 Sending review to server...');
      console.log('🔗 API URL will be:', `/api/products/${product._id}/reviews`);
      
      const result = await productService.createProductReview(product._id, { 
        rating, 
        comment: comment.trim() 
      });
      
      console.log('✅ Review submitted successfully:', result);
      
      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Refresh the product data
      console.log('🔄 Refreshing product data...');
      onReviewSubmit();
      
    } catch (error: any) {
      console.error('❌ Error submitting review:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config?.url
      });
      
      let errorMessage = "An unexpected error occurred.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to submit review",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Review submission process completed');
    }
  };

  return (
    <section className="pt-24 pb-16 px-6 md:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Images */}
          <div className="relative space-y-4">
            <div className="relative pb-[100%] bg-secondary/20 overflow-hidden rounded-lg shadow-md">
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
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3 justify-center">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "w-16 h-16 relative overflow-hidden rounded-md shadow-md transition-all duration-300 ease-smooth",
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
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-md hover-lift subtle-shadow"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={closeContactModal}
        productTitle={contactModalProduct}
      />

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-3xl font-bold mb-6">Reviews ({product.numReviews})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            {product.reviews.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-gray-400 mb-2">
                  <Star className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">No reviews yet</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                <Card key={review._id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{review.name}</CardTitle>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-5 w-5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{review.comment}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            {user ? (
              <Card>
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-8 w-8 cursor-pointer transition-colors duration-200",
                              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-200"
                            )}
                            onClick={() => setRating(i + 1)}
                          />
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Comment <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about the product..."
                        rows={4}
                        className={cn(
                          "transition-colors duration-200",
                          comment.trim() === '' ? "border-gray-300" : "border-green-300"
                        )}
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {comment.length}/500 characters
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || rating === 0 || comment.trim() === ''}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <p>Please <a href="/login" className="underline">log in</a> to write a review.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
