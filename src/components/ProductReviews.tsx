import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ShieldCheck, MessageSquare, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getProductReviews, createProductReview } from '@/services/reviewService';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  totalVotes: number;
  images?: string[];
  pros?: string[];
  cons?: string[];
  response?: {
    text: string;
    respondedAt: string;
    respondedBy: {
      name: string;
    };
  };
}

interface ProductReviewsProps {
  productId: string;
  onReviewSubmit?: () => void;
}

// Error Boundary Component
class ReviewErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ReviewErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductReviews Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mt-16 bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Review System Error</h3>
            <p className="text-gray-600 mb-4">There was an error loading the review system.</p>
            <p className="text-sm text-gray-500 mb-4">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <Button 
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              variant="outline"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onReviewSubmit }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  
  // Statistics with safe defaults
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Safe function to normalize review stats
  const normalizeReviewStats = (reviews: Review[]) => {
    // Initialize distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    // Count reviews for each rating
    reviews.forEach(review => {
      const rating = Math.round(Number(review.rating));
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    // Calculate total and average
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      totalReviews,
      averageRating,
      ratingDistribution: distribution
    };
  };

  // Safe hooks with error handling
  let user = null;
  let toast = null;

  try {
    const authResult = useAuth();
    user = authResult?.user || null;
  } catch (error) {
    console.error('Error with useAuth hook:', error);
    setComponentError('Authentication system error');
  }

  try {
    const toastResult = useToast();
    toast = toastResult?.toast || (() => {});
  } catch (error) {
    console.error('Error with useToast hook:', error);
    toast = () => {};
  }

  useEffect(() => {
    if (!productId) {
      setComponentError('No product ID provided');
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setComponentError(null);
        console.log('🔍 Fetching reviews for product:', productId);
        
        const data = await getProductReviews(productId);
        console.log('✅ Reviews fetched successfully:', data);
        
        const reviews = data?.reviews || [];
        setReviews(reviews);
        
        // Calculate stats from reviews array
        const stats = normalizeReviewStats(reviews);
        console.log('📊 Calculated stats:', stats);
        setReviewStats(stats);
      } catch (error) {
        console.error('❌ Error fetching reviews:', error);
        setComponentError('Failed to load reviews');
        if (toast) {
          toast({
            title: "Error",
            description: "Failed to load reviews",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const submitReview = async () => {
    console.log('🔍 Starting review submission process...');
    console.log('User:', user);
    console.log('Product ID:', productId);
    console.log('Review data:', { rating, title: title.trim(), comment: comment.trim() });

    if (!user) {
      if (toast) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit a review",
          variant: "destructive",
        });
      }
      return;
    }

    if (rating === 0) {
      if (toast) {
        toast({
          title: "Rating Required",
          description: "Please select a star rating",
          variant: "destructive",
        });
      }
      return;
    }

    if (!title.trim() || !comment.trim()) {
      if (toast) {
        toast({
          title: "Review Content Required",
          description: "Please provide both a title and comment",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 Submitting review to API...');
      
      const response = await createProductReview(productId, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      console.log('✅ Review submission successful:', response);

      if (toast) {
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!",
        });
      }

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setShowForm(false);

      // Refresh reviews
      console.log('🔄 Refreshing reviews...');
      const data = await getProductReviews(productId);
      setReviews(data?.reviews || []);
      setReviewStats(normalizeReviewStats(data?.reviews || []));
      
      console.log('🔄 Calling onReviewSubmit callback...');
      if (onReviewSubmit) {
        onReviewSubmit();
      }
      
      console.log('✅ Review submission process completed');
    } catch (error: any) {
      console.error('❌ Error submitting review:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = "Failed to submit review";
      
      if (error.response?.status === 401) {
        errorMessage = "Please log in to submit a review";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Invalid review data";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      if (toast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
      console.log('🔚 Review submission process ended');
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void, onStarHover?: (rating: number) => void) => {
    try {
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={interactive ? 24 : 16}
              className={cn(
                "transition-colors",
                interactive && "cursor-pointer hover:scale-110 transition-transform",
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )}
              onClick={() => interactive && onStarClick?.(star)}
              onMouseEnter={() => interactive && onStarHover?.(star)}
              onMouseLeave={() => interactive && onStarHover?.(0)}
            />
          ))}
        </div>
      );
    } catch (error) {
      console.error('Error rendering stars:', error);
      return <span>★★★★★</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Component error state
  if (componentError) {
    return (
      <div className="mt-16 bg-white rounded-lg p-6 shadow-sm border">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Review System Unavailable</h3>
          <p className="text-gray-600 mb-4">{componentError}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Safe check for user reviews
  const userHasReviewed = user && reviews.some(review => review.user?._id === user?.id);

  return (
    <ReviewErrorBoundary>
      <div className="mt-16 bg-white rounded-lg p-6 shadow-sm border">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          
          {/* Review Statistics */}
          {reviewStats.totalReviews > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Rating */}
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <span className="text-3xl font-bold">{Number(reviewStats.averageRating).toFixed(1)}</span>
                    {renderStars(Math.round(Number(reviewStats.averageRating)))}
                    <span className="text-gray-600">({Number(reviewStats.totalReviews)} reviews)</span>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    // Safe access to rating distribution with fallback
                    const starCount = reviewStats.ratingDistribution?.[star] || 0;
                    const safeStarCount = typeof starCount === 'number' ? starCount : 0;
                    const percentage = reviewStats.totalReviews > 0 ? (safeStarCount / reviewStats.totalReviews) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-8">{star}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${percentage}%`
                            }}
                          />
                        </div>
                        <span className="w-8 text-gray-600">
                          {safeStarCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Write Review Section */}
          {user && !userHasReviewed && (
            <div className="mb-8">
              {!showForm ? (
                <Button onClick={() => setShowForm(true)} className="w-full md:w-auto">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Write Your Review</h3>
                  
                  {/* Star Rating Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating *</label>
                    <div className="flex items-center gap-2">
                      {renderStars(
                        hoveredRating || rating,
                        true,
                        setRating,
                        setHoveredRating
                      )}
                      {rating > 0 && (
                        <span className="text-sm text-gray-600 ml-2">
                          {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Review Title *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Summarize your experience..."
                      maxLength={100}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">{title.length}/100 characters</div>
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Review *</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell others about your experience with this product..."
                      maxLength={1000}
                      rows={4}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={submitReview}
                      disabled={submitting || rating === 0 || !title.trim() || !comment.trim()}
                      className="flex-1 md:flex-none"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setRating(0);
                        setTitle('');
                        setComment('');
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800">
                <User className="w-4 h-4 inline mr-2" />
                Please <a href="/login" className="font-medium underline hover:text-blue-600">log in</a> to write a review
              </p>
            </div>
          )}

          {/* User already reviewed message */}
          {user && userHasReviewed && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800">
                <ShieldCheck className="w-4 h-4 inline mr-2" />
                Thank you! You have already reviewed this product.
              </p>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                      {review.isVerifiedPurchase && (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                <h4 className="font-semibold mb-2">{review.title}</h4>
                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                {/* Pros and Cons */}
                {(review.pros?.length || review.cons?.length) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {review.pros && review.pros.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-2">Pros:</h5>
                        <ul className="text-sm text-green-600 space-y-1">
                          {review.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons && review.cons.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-2">Cons:</h5>
                        <ul className="text-sm text-red-600 space-y-1">
                          {review.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Votes */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpfulVotes || 0})</span>
                  </button>
                </div>

                {/* Admin/Vendor Response */}
                {review.response && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-blue-900">Response from {review.response.respondedBy?.name}</span>
                      <span className="text-xs text-blue-600">{formatDate(review.response.respondedAt)}</span>
                    </div>
                    <p className="text-blue-800 text-sm">{review.response.text}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ReviewErrorBoundary>
  );
};

export default ProductReviews; 