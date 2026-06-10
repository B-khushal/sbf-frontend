import api from './api';
import { buildProductReviewUrl } from '@/utils/reviewUrls';

export interface ReviewImageEntry {
  _id: string;
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface ReviewReply {
  _id: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  authorRole: 'user' | 'admin' | 'vendor';
  authorName: string;
  isAdminReply: boolean;
  parentReply?: string | null;
  user?: {
    _id: string;
    name: string;
    role?: string;
  } | null;
  children?: ReviewReply[];
}

export interface Review {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email?: string;
    role?: string;
  };
  product?: {
    _id: string;
    title: string;
    images?: string[];
    category?: string;
  };
  orderId?: string | {
    _id: string;
    orderNumber?: string;
    status?: string;
    createdAt?: string;
  };
  name: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  moderationReason?: string;
  moderatorNotes?: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  totalVotes: number;
  likedByViewer?: boolean;
  helpfulnessPercentage?: number;
  images: string[];
  imageEntries?: ReviewImageEntry[];
  imageCount?: number;
  pros?: string[];
  cons?: string[];
  replies?: ReviewReply[];
  replyCount?: number;
  featured?: boolean;
  pinned?: boolean;
  qualityRating?: number | null;
  valueRating?: number | null;
  deliveryRating?: number | null;
  response?: {
    text: string;
    respondedAt: string;
    respondedBy?: {
      _id?: string;
      name: string;
      role?: string;
    };
  } | null;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  verifiedPurchases: number;
  verifiedPurchasePercentage: number;
  averageQualityRating?: number | null;
  averageValueRating?: number | null;
  averageDeliveryRating?: number | null;
  imagesCount?: number;
  helpfulVotes?: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewEligibilityOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  hasReview: boolean;
  review?: {
    reviewId: string;
    status: 'pending' | 'approved' | 'rejected' | 'spam';
    rating: number;
    createdAt: string;
  } | null;
}

export interface ReviewViewerState {
  canReview: boolean;
  eligibleOrders: ReviewEligibilityOrder[];
  ownReviews: Array<{
    _id: string;
    orderId: string;
    status: Review['status'];
    rating: number;
    title: string;
    createdAt: string;
    updatedAt?: string;
  }>;
}

export interface ProductReviewsResponse {
  product: {
    _id: string;
    title: string;
    primaryImage: string;
  };
  stats: ReviewStats;
  galleryImages: ReviewImageEntry[];
  featuredReviews: Review[];
  helpfulReviews: Review[];
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  viewer: ReviewViewerState | null;
  filters: {
    applied: {
      sort: string;
      rating: number | null;
      verified: boolean;
      withImages: boolean;
    };
  };
}

export interface CreateReviewData {
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  pros?: string[];
  cons?: string[];
  images?: string[];
  source?: 'product_page' | 'product_reviews_page' | 'order_history' | 'review_email';
}

export interface AdminReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNext: boolean;
    hasPrev: boolean;
    pageSize: number;
  };
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
  };
}

export interface ReviewAnalytics {
  overview: {
    totalReviews: number;
    approvedReviews: number;
    pendingReviews: number;
    spamReviews: number;
    averageRating: number;
  };
  ratingTrends: Array<{
    date: string;
    totalReviews: number;
    averageRating: number;
  }>;
  mostReviewedProducts: Array<{
    productId: string;
    title: string;
    image: string;
    category: string;
    totalReviews: number;
    approvedReviews: number;
    averageRating: number;
  }>;
}

export const getProductReviews = async (
  productId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: 'latest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
    rating?: number;
    verified?: boolean;
    withImages?: boolean;
  }
): Promise<ProductReviewsResponse> => {
  const response = await api.get(`/products/${productId}/reviews`, {
    params,
  });
  return response.data;
};

export const getReviewEligibility = async (productId: string): Promise<{
  product: {
    _id: string;
    title: string;
  };
  viewer: ReviewViewerState;
}> => {
  const response = await api.get(`/products/${productId}/reviews/eligibility`);
  return response.data;
};

export const createProductReview = async (productId: string, reviewData: CreateReviewData) => {
  const response = await api.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

export const toggleReviewHelpful = async (reviewId: string) => {
  const response = await api.post(`/reviews/${reviewId}/likes`);
  return response.data as {
    message: string;
    liked: boolean;
    helpfulVotes: number;
    totalVotes: number;
    helpfulnessPercentage: number;
  };
};

export const voteOnReview = toggleReviewHelpful;

export const addReviewReply = async (
  reviewId: string,
  payload: {
    message: string;
    parentReplyId?: string;
  }
) => {
  const response = await api.post(`/reviews/${reviewId}/replies`, payload);
  return response.data as {
    message: string;
    review: Review;
    reply: ReviewReply;
  };
};

export const getUserReviews = async (params?: {
  page?: number;
  limit?: number;
  status?: Review['status'];
}) => {
  const response = await api.get(`/reviews/my-reviews`, {
    params,
  });
  return response.data as {
    reviews: Review[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
};

export const updateReview = async (reviewId: string, updateData: Partial<CreateReviewData>) => {
  const response = await api.put(`/reviews/${reviewId}`, updateData);
  return response.data as {
    message: string;
    review: Review;
  };
};

export const deleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data as {
    message: string;
  };
};

export const respondToReview = async (
  reviewId: string,
  responseText: string,
  parentReplyId?: string
) => {
  return addReviewReply(reviewId, {
    message: responseText,
    parentReplyId,
  });
};

export const getAdminReviews = async (params?: {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
  product?: string;
  customer?: string;
  rating?: number;
  status?: Review['status'];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  withImages?: boolean;
}): Promise<AdminReviewsResponse> => {
  const response = await api.get('/reviews/admin', { params });
  return response.data;
};

export const moderateReview = async (
  reviewId: string,
  payload: {
    status?: Review['status'];
    moderationReason?: string;
    moderatorNotes?: string;
    featured?: boolean;
    pinned?: boolean;
    title?: string;
    comment?: string;
    rating?: number;
  }
) => {
  const response = await api.patch(`/reviews/${reviewId}/moderation`, payload);
  return response.data as {
    message: string;
    review: Review;
  };
};

export const getAdminReviewAnalytics = async (days = 90): Promise<ReviewAnalytics> => {
  const response = await api.get('/reviews/admin/analytics', {
    params: { days },
  });
  return response.data;
};

export const sendOrderReviewEmail = async (orderId: string) => {
  const response = await api.post(`/orders/${orderId}/send-review-email`);
  return response.data as {
    message: string;
    summary: {
      orderId: string;
      orderNumber: string;
      customerEmail: string;
      productCount: number;
      messageId: string;
    };
  };
};

export const getReviewPageUrl = (
  productId: string,
  productTitle: string,
  orderId?: string
) => buildProductReviewUrl(productId, productTitle, { orderId });

export default {
  addReviewReply,
  buildProductReviewUrl,
  createProductReview,
  deleteReview,
  getAdminReviewAnalytics,
  getAdminReviews,
  getProductReviews,
  getReviewEligibility,
  getReviewPageUrl,
  getUserReviews,
  moderateReview,
  respondToReview,
  sendOrderReviewEmail,
  toggleReviewHelpful,
  updateReview,
  voteOnReview,
};
