import api from './api';

export interface VendorRegistrationData {
  storeName: string;
  storeDescription: string;
  storeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  businessInfo: {
    registrationNumber?: string;
    taxId?: string;
    businessType: 'individual' | 'partnership' | 'llc' | 'corporation';
  };
  bankDetails: {
    accountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
    bankName?: string;
    upiId?: string;
  };
}

export interface VendorProfile {
  _id: string;
  user: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  storeBanner?: string;
  storeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  businessInfo: {
    registrationNumber?: string;
    taxId?: string;
    businessType: string;
  };
  bankDetails: {
    accountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
    bankName?: string;
    upiId?: string;
  };
  commission: {
    rate: number;
    type: string;
  };
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  verification: {
    isVerified: boolean;
    documentsSubmitted: boolean;
    verificationDate?: string;
  };
  subscription: {
    plan: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  };
  storeSettings: {
    isStoreOpen: boolean;
    processingTime: number;
    shippingPolicy?: string;
    returnPolicy?: string;
    termsAndConditions?: string;
    acceptsReturns: boolean;
    returnWindow: number;
  };
  salesSettings: {
    autoApproveOrders: boolean;
    allowBackorders: boolean;
    lowStockThreshold: number;
    notifyLowStock: boolean;
  };
  analytics: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
        totalCommissionPaid: number;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VendorDashboardData {
  vendor: {
    storeName: string;
    status: string;
    isVerified: boolean;
    subscription: {
      plan: string;
      isActive: boolean;
    };
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    monthlyOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
    vendorEarnings: number;
    monthlyEarnings: number;
    pendingOrders: number;
    lowStockCount: number;
  };
  recentOrders: any[];
  lowStockProducts: any[];
  charts: {
    salesTrend: any[];
    topProducts: any[];
  };
}

export interface VendorSettingsData {
  storeName: string;
  storeDescription: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  payoutInfo: {
    bankAccountHolder: string;
    bankAccountNumber: string;
    bankIfsc: string;
  };
}

// Vendor registration and profile
export const registerVendor = async (data: VendorRegistrationData) => {
  try {
    const response = await api.post('/vendors/register', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to register vendor. Please try again later.');
  }
};

export const getVendorProfile = async (): Promise<{ vendor: VendorProfile }> => {
  try {
    const response = await api.get('/vendors/profile');
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch vendor profile. Please try again later.');
  }
};

export const updateVendorProfile = async (data: Partial<VendorProfile>) => {
  try {
    const response = await api.put('/vendors/profile', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to update vendor profile. Please try again later.');
  }
};

// Vendor dashboard
export const getVendorDashboard = async (): Promise<VendorDashboardData> => {
  try {
    const response = await api.get('/vendors/dashboard');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Vendor profile not found. Please complete registration first.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch vendor dashboard. Please try again later.');
  }
};

// Vendor products
export const getVendorProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}) => {
  const response = await api.get('/vendors/products', { params });
  return response.data;
};

// Vendor orders
export const getVendorOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/vendors/orders', { params });
  return response.data;
};

// Vendor analytics
export const getVendorAnalytics = async (period: string = '30d') => {
  const response = await api.get('/vendors/analytics', { params: { period } });
  return response.data;
};

// Vendor payouts
export const getVendorPayouts = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/vendors/payouts', { params });
  return response.data;
};

// Vendor settings
export const getVendorSettings = async (): Promise<VendorSettingsData> => {
  const response = await api.get('/vendors/settings');
  return response.data;
};

export const updateVendorSettings = async (data: VendorSettingsData) => {
  const response = await api.put('/vendors/settings', data);
  return response.data;
};

// Admin functions
export const getAllVendors = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const response = await api.get('/vendors/admin/all', { params });
  return response.data;
};

export const updateVendorStatus = async (vendorId: string, status: string) => {
  const response = await api.put(`/vendors/admin/${vendorId}/status`, { status });
  return response.data;
};

export const getVendorById = async (vendorId: string): Promise<VendorProfile> => {
  const response = await api.get(`/vendors/admin/${vendorId}`);
  return response.data;
};

export default {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendorProducts,
  getVendorOrders,
  getVendorAnalytics,
  getVendorPayouts,
  getAllVendors,
  updateVendorStatus,
  getVendorById,
  getVendorSettings,
  updateVendorSettings,
}; 