import api from './api';

export interface Review {
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

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewData {
  rating: number;
  title: string;
  comment: string;
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

// Get reviews for a product
export const getProductReviews = async (productId: string, params?: {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
  rating?: number;
  verified?: boolean;
  withImages?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.rating) queryParams.append('rating', params.rating.toString());
  if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());
  if (params?.withImages !== undefined) queryParams.append('withImages', params.withImages.toString());

  const response = await api.get(`/products/${productId}/reviews?${queryParams.toString()}`);
  return response.data;
};

// Create a new review
export const createProductReview = async (productId: string, reviewData: CreateReviewData) => {
  const response = await api.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

// Vote on review helpfulness
export const voteOnReview = async (reviewId: string, vote: 'helpful' | 'not_helpful') => {
  const response = await api.post(`/reviews/${reviewId}/vote`, { vote });
  return response.data;
};

// Get current user's reviews
export const getUserReviews = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get(`/reviews/my-reviews?${queryParams.toString()}`);
  return response.data;
};

// Update a review (only allowed for review owner)
export const updateReview = async (reviewId: string, updateData: Partial<CreateReviewData>) => {
  const response = await api.put(`/reviews/${reviewId}`, updateData);
  return response.data;
};

// Delete a review (only allowed for review owner or admin)
export const deleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// Admin/Vendor respond to review
export const respondToReview = async (reviewId: string, responseText: string) => {
  const response = await api.post(`/reviews/${reviewId}/respond`, { text: responseText });
  return response.data;
};

export default {
  getProductReviews,
  createProductReview,
  voteOnReview,
  getUserReviews,
  updateReview,
  deleteReview,
  respondToReview,
}; 