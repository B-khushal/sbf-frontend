import api from './api';

export interface PromoCode {
  _id: string;
  id: string;
  code: string;
  description: string;
  image?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableCategories: string[];
  excludedCategories: string[];
  applicableProducts: string[];
  excludedProducts: string[];
  firstTimeUserOnly: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  metadata: {
    campaignName?: string;
    notes?: string;
    tags?: string[];
  };
  isCurrentlyValid?: boolean;
  remainingUses?: number;
  usagePercentage?: number;
}

export interface PromoCodeFormData {
  code: string;
  description: string;
  image?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: string;
  validUntil: string;
  isActive?: boolean;
  applicableCategories?: string[];
  excludedCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  firstTimeUserOnly?: boolean;
  metadata?: {
    campaignName?: string;
    notes?: string;
    tags?: string[];
  };
}

export interface PromoCodeValidationResult {
  success: boolean;
  message: string;
  data?: {
    promoCode: {
      id: string;
      code: string;
      description: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
    };
    discount: {
      amount: number;
      percentage: number;
      savings: number;
    };
    order: {
      originalAmount: number;
      discountAmount: number;
      finalAmount: number;
    };
  };
}

export interface PromoCodeStats {
  overview: {
    total: number;
    active: number;
    expired: number;
    inactive: number;
  };
  usage: {
    totalApplications: number;
    averageUsagePerCode: number;
  };
  topPerforming: PromoCode[];
}

// Get all promo codes (admin only)
export const getAllPromoCodes = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'expired';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/promocodes', { params });
  return response.data;
};

// Get single promo code by ID (admin only)
export const getPromoCodeById = async (id: string) => {
  const response = await api.get(`/promocodes/${id}`);
  return response.data;
};

// Create new promo code (admin only)
export const createPromoCode = async (data: PromoCodeFormData) => {
  const response = await api.post('/promocodes', data);
  return response.data;
};

// Update promo code (admin only)
export const updatePromoCode = async (id: string, data: Partial<PromoCodeFormData>) => {
  const response = await api.put(`/promocodes/${id}`, data);
  return response.data;
};

// Delete promo code (admin only)
export const deletePromoCode = async (id: string) => {
  const response = await api.delete(`/promocodes/${id}`);
  return response.data;
};

// Validate promo code during checkout (public)
export const validatePromoCode = async (data: {
  code: string;
  orderAmount: number;
  items?: any[];
  userId?: string;
}): Promise<PromoCodeValidationResult> => {
  try {
    const response = await api.post('/promocodes/validate', data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to validate promo code'
    };
  }
};

// Apply promo code to order (protected)
export const applyPromoCode = async (data: {
  code: string;
  orderId: string;
}) => {
  const response = await api.post('/promocodes/apply', data);
  return response.data;
};

// Get promo code statistics (admin only)
export const getPromoCodeStats = async (): Promise<{ success: boolean; data: PromoCodeStats }> => {
  const response = await api.get('/promocodes/stats');
  return response.data;
};

// Helper functions for frontend

export const formatDiscountDisplay = (promoCode: PromoCode): string => {
  if (promoCode.discountType === 'percentage') {
    return `${promoCode.discountValue}% OFF`;
  } else {
    return `₹${promoCode.discountValue} OFF`;
  }
};

export const formatMinimumOrderDisplay = (amount: number): string => {
  return amount > 0 ? `Min order: ₹${amount}` : '';
};

export const formatValidityDisplay = (validFrom: string, validUntil: string): string => {
  const fromDate = new Date(validFrom);
  const untilDate = new Date(validUntil);
  const now = new Date();
  
  if (now < fromDate) {
    return `Starts: ${fromDate.toLocaleDateString()}`;
  } else if (now > untilDate) {
    return `Expired: ${untilDate.toLocaleDateString()}`;
  } else {
    return `Valid until: ${untilDate.toLocaleDateString()}`;
  }
};

export const isPromoCodeValid = (promoCode: PromoCode): boolean => {
  const now = new Date();
  const validFrom = new Date(promoCode.validFrom);
  const validUntil = new Date(promoCode.validUntil);
  
  return (
    promoCode.isActive &&
    now >= validFrom &&
    now <= validUntil &&
    (promoCode.usageLimit === null || promoCode.usageLimit === undefined || promoCode.usedCount < promoCode.usageLimit)
  );
};

export const getPromoCodeStatus = (promoCode: PromoCode): 'active' | 'inactive' | 'expired' | 'pending' => {
  const now = new Date();
  const validFrom = new Date(promoCode.validFrom);
  const validUntil = new Date(promoCode.validUntil);
  
  if (!promoCode.isActive) {
    return 'inactive';
  } else if (now > validUntil) {
    return 'expired';
  } else if (now < validFrom) {
    return 'pending';
  } else {
    return 'active';
  }
};

export const calculateDiscountPreview = (
  orderAmount: number, 
  discountType: 'percentage' | 'fixed', 
  discountValue: number,
  maximumDiscount?: number
): { discountAmount: number; finalAmount: number } => {
  let discountAmount = 0;
  
  if (discountType === 'percentage') {
    discountAmount = (orderAmount * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }
  
  // Apply maximum discount limit
  if (maximumDiscount && discountAmount > maximumDiscount) {
    discountAmount = maximumDiscount;
  }
  
  // Ensure discount doesn't exceed order amount
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }
  
  const finalAmount = Math.max(0, orderAmount - discountAmount);
  
  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100
  };
}; 