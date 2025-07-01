import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sbf-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

// Login user
export const login = async (credentials: LoginCredentials) => {
  try {
    console.log("🔍 Sending login request:", credentials);

    const response = await api.post("/auth/login", credentials, {
      timeout: 10000, // ✅ Prevents infinite waiting
    });

    console.log("✅ Login response:", response.data); // ✅ Debugging

    if (response.data && response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role || "user");
      localStorage.setItem("isAuthenticated", "true");
    }

    return response.data;
  } catch (error) {
    console.error("🚨 Login error:", error);
    throw error;
  }
};


// Register user
export const register = async (userData: RegisterData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock registration for development');
      const mockUser = {
        _id: 'user123',
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        token: 'mock_token',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('isAuthenticated', 'true');
      return mockUser;
    }
    throw error;
  }
};

// Logout user
export const logout = async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData: UserProfile) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    
    if (response.data && response.data.token) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock profile update for development');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...currentUser,
        name: profileData.name || currentUser.name,
        email: profileData.email || currentUser.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw error;
  }
};

// Change password
export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await api.post('/auth/change-password', { oldPassword, newPassword });
  return response.data;
};

// Reset password (after forgot password)
export const resetPassword = async (token: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// Forgot password (request reset)
export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Social login - updated to use real Google OAuth
export const socialLogin = async (provider: string, credential?: string) => {
  try {
    const response = await api.post('/auth/google', { 
      provider,
      credential 
    });
    
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role || 'user');
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    return response.data;
  } catch (error) {
    // Fallback to mock for development if backend is not ready
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock social login for development');
      const mockUser = {
        _id: 'social123',
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        role: 'user',
        token: 'mock_social_token',
        provider: provider
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('role', mockUser.role);
      localStorage.setItem('isAuthenticated', 'true');
      
      return mockUser;
    }
    throw error;
  }
};

// Check if token is valid (useful for route guards)
export const checkAuthToken = async () => {
  try {
    const response = await api.get('/auth/verify-token');
    return response.data.valid;
  } catch (error) {
    const token = localStorage.getItem('token');
    
    // If no token exists, return false without clearing storage
    if (!token) {
      return false;
    }
    
    // Save cart state before clearing auth
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    const cartKey = `cart_${userId}`;
    const savedCart = localStorage.getItem(cartKey);
    
    // Clear invalid authentication but preserve cart
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Restore cart state if it existed
    if (savedCart && userId) {
      localStorage.setItem(cartKey, savedCart);
    }
    
    return false;
  }
};

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error during forgot password:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Error during email verification:', error);
      throw error;
    }
  },

  resendVerificationEmail: async (email: string) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  updateProfile: async (userData: any) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Google OAuth
  googleLogin: async (token: string) => {
    try {
      const response = await api.post('/auth/google', { token });
      return response.data;
    } catch (error) {
      console.error('Error during Google login:', error);
      throw error;
    }
  },

  // Check auth status
  checkAuthStatus: async () => {
    try {
      const response = await api.get('/auth/status');
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      throw error;
    }
  },
};

