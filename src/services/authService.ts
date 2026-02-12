import api from './api';


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
export const logout = () => {
  // Get user ID before clearing user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;
  
  // Clear user-specific cart if user was logged in
  if (userId) {
    localStorage.removeItem(`cart_${userId}`);
    console.log(`🧹 Cleared cart for user: ${userId} during logout`);
  }
  
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  
  try {
    api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.warn('getUserProfile API call failed, using fallback:', error);
    
    // Try to get user data from localStorage as fallback
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser;
      } catch (parseError) {
        console.error('Failed to parse stored user data:', parseError);
        throw error; // Re-throw original error if fallback fails
      }
    }
    
    throw error;
  }
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
  const response = await api.put('/auth/change-password', { oldPassword, newPassword });
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
export const socialLogin = async (provider: string, credential?: string, agreedToTerms?: boolean) => {
  try {
    const response = await api.post('/auth/google', { 
      provider,
      credential,
      agreedToTerms 
    });
    
    // If this is a new user and they haven't accepted terms yet
    if (response.data.isNewUser && !agreedToTerms) {
      return response.data;
    }
    
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

