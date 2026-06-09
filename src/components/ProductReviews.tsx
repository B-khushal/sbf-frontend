import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ShieldCheck, MessageSquare, Calendar, User, PenSquare, Sparkles, Check, CheckCircle2, ChevronDown, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getProductReviews, createProductReview } from '@/services/reviewService';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="mt-16 bg-white dark:bg-slate-950 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-900 text-center">
          <h3 className="text-lg font-bold text-rose-500 mb-2">Review System Interrupted</h3>
          <p className="text-xs text-slate-500 mb-4">We encountered an issue preparing the testimonial section.</p>
          <Button 
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            variant="outline"
            className="rounded-xl"
          >
            Reload Section
          </Button>
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
  
  // Statistics
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const normalizeReviewStats = (reviews: Review[]) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.round(Number(review.rating));
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      totalReviews,
      averageRating,
      ratingDistribution: distribution
    };
  };

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setComponentError(null);
      const data = await getProductReviews(productId);
      const reviewList = data?.reviews || [];
      setReviews(reviewList);
      setReviewStats(normalizeReviewStats(reviewList));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setComponentError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast({
        title: "Review Content Required",
        description: "Please provide both a title and comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createProductReview(productId, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!",
      });

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setShowForm(false);

      // Refresh reviews
      await fetchReviews();
      
      if (onReviewSubmit) {
        onReviewSubmit();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void, onStarHover?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 26 : 14}
            className={cn(
              "transition-all duration-200",
              interactive && "cursor-pointer hover:scale-120 hover:rotate-6 active:scale-95",
              star <= rating 
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]" 
                : "text-slate-200 dark:text-slate-800"
            )}
            onClick={() => interactive && onStarClick?.(star)}
            onMouseEnter={() => interactive && onStarHover?.(star)}
            onMouseLeave={() => interactive && onStarHover?.(0)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get initials for customer avatar
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const userHasReviewed = user && reviews.some(review => review.user?._id === user?.id);

  if (componentError) {
    return (
      <div className="mt-16 bg-white dark:bg-slate-950 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-900 text-center">
        <h3 className="text-lg font-bold text-rose-500 mb-2">Review Service Interrupted</h3>
        <p className="text-xs text-slate-500 mb-4">{componentError}</p>
        <Button onClick={fetchReviews} variant="outline" className="rounded-xl">Try Again</Button>
      </div>
    );
  }

  return (
    <ReviewErrorBoundary>
      <div className="mt-20 bg-white/40 dark:bg-slate-950/20 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-900/60 shadow-[0_15px_50px_rgba(0,0,0,0.02)]">
        
        {/* Header section with ratings overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Customer Testimonials
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Honest feedback from our premium gifting community.</p>
          </div>
          
          {user && !userHasReviewed && !showForm && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="rounded-xl h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <PenSquare size={16} />
              Share Your Experience
            </Button>
          )}
        </div>

        {/* 1. Review Statistics Dashboard */}
        {reviewStats.totalReviews > 0 && (
          <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Average Score */}
              <div className="md:col-span-4 text-center md:border-r border-slate-100 dark:border-slate-850 md:pr-6">
                <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100">
                  {Number(reviewStats.averageRating).toFixed(1)}
                </span>
                <div className="flex justify-center mt-2.5 mb-1.5">
                  {renderStars(Math.round(Number(reviewStats.averageRating)))}
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Based on {reviewStats.totalReviews} reviews
                </p>
              </div>

              {/* Progress Bars distribution */}
              <div className="md:col-span-8 space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const starCount = reviewStats.ratingDistribution?.[star as keyof typeof reviewStats.ratingDistribution] || 0;
                  const percentage = reviewStats.totalReviews > 0 ? (starCount / reviewStats.totalReviews) * 100 : 0;
                  
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-8 font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5 justify-end">
                        {star} <Star size={10} className="fill-slate-400 text-slate-400" />
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-amber-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <span className="w-8 text-slate-450 dark:text-slate-500 font-bold text-right">
                        {starCount}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* 2. FloatingHighlights Tags (Visual element for trust builder) */}
        {reviewStats.totalReviews > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center mr-2">Top Praise:</span>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1 rounded-full cursor-default">
              💐 Exquisite Styling
            </span>
            <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-3 py-1 rounded-full cursor-default">
              🚚 Rapid Same-day Delivery
            </span>
            <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 px-3 py-1 rounded-full cursor-default">
              💝 Fresh Fragrant Blooms
            </span>
          </div>
        )}

        {/* 3. Review Submission Form (Drawer Accordion style) */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-450" />
                    Write Your Gifting Experience
                  </h3>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                </div>
                
                {/* Star selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your rating *</label>
                  <div className="flex items-center gap-3">
                    {renderStars(hoveredRating || rating, true, setRating, setHoveredRating)}
                    {rating > 0 && (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md">
                        {rating === 5 ? 'Exceptional' : rating === 4 ? 'Very Good' : rating === 3 ? 'Satisfactory' : rating === 2 ? 'Fair' : 'Disappointing'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Review Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your key impressions (e.g. Absolutely stunning roses!)"
                    maxLength={100}
                    className="h-11 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 rounded-xl focus:ring-primary text-sm font-semibold"
                  />
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Detail testimonial *</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe how the arrangement arrived, the floral fragrance, packing, and overall recipient feedback..."
                    maxLength={1000}
                    rows={4}
                    className="bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 rounded-xl resize-none text-sm font-medium"
                  />
                  <div className="text-right text-[9px] text-slate-400">{comment.length}/1000 characters</div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex gap-3">
                  <Button
                    onClick={submitReview}
                    disabled={submitting || rating === 0 || !title.trim() || !comment.trim()}
                    className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-slate-900 text-white font-bold hover:shadow-md transition-all active:scale-95"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Publish Testimonial'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest user check-in banner */}
        {!user && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Sign in to share your gifting feedback on this product.
            </p>
            <a href="/login" className="text-xs font-extrabold text-primary hover:underline">Log In</a>
          </div>
        )}

        {/* Already reviewed banner */}
        {user && userHasReviewed && (
          <div className="mb-8 p-4 bg-emerald-50/50 dark:bg-emerald-950/15 rounded-2xl border border-emerald-100/70 dark:border-emerald-950/40 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
              Thank you! You have already published a testimonial for this arrangement.
            </p>
          </div>
        )}

        {/* 4. Testimonials List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">Retrieving client testimonials...</p>
            </div>
          ) : reviews.length === 0 ? (
            
            /* Beautiful empty state design */
            <div className="text-center py-14 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/60 text-slate-300 dark:text-slate-700 flex items-center justify-center mx-auto shadow-inner">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No testimonials yet</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  Be the first to share your gifting story and bouquet experience with the community.
                </p>
              </div>
              {user && !userHasReviewed && !showForm && (
                <Button 
                  onClick={() => setShowForm(true)} 
                  variant="outline"
                  className="rounded-xl h-10 border-slate-200 hover:bg-slate-50 text-xs font-bold"
                >
                  Write the First Review
                </Button>
              )}
            </div>

          ) : (
            
            /* Staggered cards design */
            <div className="grid grid-cols-1 gap-4 mt-6">
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.015)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  
                  {/* Card Header: User avatar + verified status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      
                      {/* Avatar initials */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-350 text-xs font-extrabold flex items-center justify-center shadow-inner">
                        {getUserInitials(review.user?.name || 'Anonymous')}
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-200">
                          {review.user?.name || 'Anonymous client'}
                        </h4>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          {review.isVerifiedPurchase && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              <Check className="w-2.5 h-2.5" />
                              Verified Buyer
                            </span>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Review Date */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>

                  {/* Comment title & body */}
                  <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-1.5">{review.title}</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">{review.comment}</p>

                  {/* Vendor reply / response */}
                  {review.response && (
                    <div className="mt-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900 rounded-xl p-3.5 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/20 text-pink-500 flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                        SBF
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-250">Gifting Care Desk</span>
                          <span className="text-[9px] text-slate-400">{formatDate(review.response.respondedAt)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold italic">"{review.response.text}"</p>
                      </div>
                    </div>
                  )}

                  {/* Action row (helpful buttons) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-900/40 text-xs">
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-650 transition-colors font-bold active:scale-95">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Helpful ({review.helpfulVotes || 0})
                    </button>
                    
                    <span className="text-[10px] text-slate-350 dark:text-slate-600 uppercase font-bold tracking-widest flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Certified feedback
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ReviewErrorBoundary>
  );
};

export default ProductReviews;