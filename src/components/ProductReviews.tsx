import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Camera, Verified, Filter, SortAsc, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  name: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  images: string[];
  pros: string[];
  cons: string[];
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  helpfulVotes: number;
  totalVotes: number;
  helpfulnessPercentage: number;
  createdAt: string;
  response?: {
    text: string;
    respondedBy: {
      name: string;
      role: string;
    };
    respondedAt: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  verifiedPurchases: number;
  verifiedPurchasePercentage: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  averageQualityRating?: number;
  averageValueRating?: number;
  averageDeliveryRating?: number;
}

interface ProductReviewsProps {
  productId: string;
  onReviewSubmit: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onReviewSubmit }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  
  // Filters and sorting
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('');
  
  // Review form
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    qualityRating: 0,
    valueRating: 0,
    deliveryRating: 0,
    pros: [''],
    cons: ['']
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '10',
        sort: sortBy,
        ...(filterRating && { rating: filterRating })
      });

      console.log('🔍 Fetching reviews for product:', productId);
      const response = await fetch(`/api/products/${productId}/reviews?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Reviews fetched successfully:', data);
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      } else {
        console.log('❌ Failed to fetch reviews, status:', response.status);
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.log('Error data:', errorData);
        // Fallback for when new API isn't available yet
        setReviews([]);
        setStats(null);
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      // Use existing reviews if available
      setReviews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a review",
        variant: "destructive"
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    if (formData.title.trim().length < 5) {
      toast({
        title: "Title too short", 
        description: "Title must be at least 5 characters",
        variant: "destructive"
      });
      return;
    }

    if (formData.comment.trim().length < 10) {
      toast({
        title: "Comment too short",
        description: "Comment must be at least 10 characters", 
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        qualityRating: formData.qualityRating || null,
        valueRating: formData.valueRating || null,
        deliveryRating: formData.deliveryRating || null,
        pros: formData.pros.filter(pro => pro.trim() !== ''),
        cons: formData.cons.filter(con => con.trim() !== '')
      };

      console.log('📤 Submitting review:', reviewData);
      console.log('🔗 API endpoint:', `/api/products/${productId}/reviews`);
      console.log('🔑 Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Review submitted successfully:', responseData);
        
        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback"
        });
        
        setFormData({
          rating: 0,
          title: '',
          comment: '',
          qualityRating: 0,
          valueRating: 0,
          deliveryRating: 0,
          pros: [''],
          cons: ['']
        });
        
        setActiveTab('reviews');
        fetchReviews();
        onReviewSubmit();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.log('❌ Review submission failed:', errorData);
        throw new Error(errorData.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('❌ Review submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5",
              interactive && "cursor-pointer hover:scale-110 transition-transform",
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm w-3">{rating}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Customer Reviews ({stats.totalReviews})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating))}
                <p className="text-sm text-gray-500 mt-1">
                  Based on {stats.totalReviews} reviews
                </p>
                {stats.verifiedPurchasePercentage > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    <Verified className="h-3 w-3 mr-1" />
                    {stats.verifiedPurchasePercentage}% verified
                  </Badge>
                )}
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-medium mb-3">Rating Distribution</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'reviews'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            All Reviews
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'write'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Write Review
          </button>
        </nav>
      </div>

      {/* Filters and Sorting */}
      {activeTab === 'reviews' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest_rating">Highest Rating</option>
              <option value="lowest_rating">Lowest Rating</option>
              <option value="most_helpful">Most Helpful</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this product!</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review._id} className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {renderStars(review.rating)}
                          <span className="font-medium">{review.title}</span>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-xs">
                              <Verified className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>By {review.name}</span>
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Helpfulness Votes */}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {review.helpfulVotes}
                        </Button>
                        {review.totalVotes > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {review.helpfulnessPercentage}% helpful
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-700">{review.comment}</p>

                    {/* Pros and Cons */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">Pros:</h5>
                            <ul className="space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                                  <span className="text-green-500">✓</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="font-medium text-red-700 mb-2">Cons:</h5>
                            <ul className="space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                                  <span className="text-red-500">✗</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Additional Ratings */}
                    {(review.qualityRating || review.valueRating || review.deliveryRating) && (
                      <div className="border-t pt-4">
                        <h5 className="font-medium mb-3">Detailed Ratings:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {review.qualityRating && (
                            <div>
                              <span className="text-sm text-gray-600">Quality</span>
                              {renderStars(review.qualityRating)}
                            </div>
                          )}
                          {review.valueRating && (
                            <div>
                              <span className="text-sm text-gray-600">Value</span>
                              {renderStars(review.valueRating)}
                            </div>
                          )}
                          {review.deliveryRating && (
                            <div>
                              <span className="text-sm text-gray-600">Delivery</span>
                              {renderStars(review.deliveryRating)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin/Vendor Response */}
                    {review.response && (
                      <div className="border-t pt-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              Response from {review.response.respondedBy.name}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(review.response.respondedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{review.response.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'write' && (
        <div>
          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Overall Rating */}
                  <div>
                    <label className="text-base font-medium block mb-2">Overall Rating *</label>
                    <div className="mt-2">
                      {renderStars(formData.rating, true, (rating) => 
                        setFormData(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label htmlFor="title" className="text-base font-medium block mb-2">Review Title *</label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summarize your experience..."
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label htmlFor="comment" className="text-base font-medium block mb-2">Your Review *</label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Tell others about your experience with this product..."
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/1000 characters</p>
                  </div>

                  {/* Additional Ratings */}
                  <div>
                    <label className="text-base font-medium block mb-2">Detailed Ratings (Optional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <label className="text-sm block mb-1">Quality</label>
                        <div className="mt-1">
                          {renderStars(formData.qualityRating, true, (rating) => 
                            setFormData(prev => ({ ...prev, qualityRating: rating }))
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm block mb-1">Value for Money</label>
                        <div className="mt-1">
                          {renderStars(formData.valueRating, true, (rating) => 
                            setFormData(prev => ({ ...prev, valueRating: rating }))
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm block mb-1">Delivery Experience</label>
                        <div className="mt-1">
                          {renderStars(formData.deliveryRating, true, (rating) => 
                            setFormData(prev => ({ ...prev, deliveryRating: rating }))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium block mb-2">What did you like? (Optional)</label>
                      <div className="space-y-2 mt-2">
                        {formData.pros.map((pro, index) => (
                          <Input
                            key={index}
                            value={pro}
                            onChange={(e) => {
                              const newPros = [...formData.pros];
                              newPros[index] = e.target.value;
                              setFormData(prev => ({ ...prev, pros: newPros }));
                            }}
                            placeholder={`Pro ${index + 1}...`}
                            className="text-sm"
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, pros: [...prev.pros, ''] }))}
                          disabled={formData.pros.length >= 5}
                        >
                          Add Pro
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-base font-medium block mb-2">What could be improved? (Optional)</label>
                      <div className="space-y-2 mt-2">
                        {formData.cons.map((con, index) => (
                          <Input
                            key={index}
                            value={con}
                            onChange={(e) => {
                              const newCons = [...formData.cons];
                              newCons[index] = e.target.value;
                              setFormData(prev => ({ ...prev, cons: newCons }));
                            }}
                            placeholder={`Con ${index + 1}...`}
                            className="text-sm"
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, cons: [...prev.cons, ''] }))}
                          disabled={formData.cons.length >= 5}
                        >
                          Add Con
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || formData.rating === 0 || formData.title.trim() === '' || formData.comment.trim() === ''}
                    className="w-full"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to write a review</h3>
                <p className="text-gray-500 mb-4">Share your experience with other customers</p>
                <Button asChild>
                  <a href="/login">Sign In</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews; 