import React, { createContext, useState, useEffect } from 'react';
import { login, register, logout, socialLogin, getUserProfile, updateUserProfile } from '@/services/authService';

// Define types for our authentication context
type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'vendor';
  photoURL?: string;
  provider?: string;
  token?: string;
};

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; redirectTo?: string }>;
  logout: () => void;
  socialLogin: (provider: string, credential?: string) => Promise<{ success: boolean; redirectTo?: string }>;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // First check for auth_data in sessionStorage (post-payment recovery)
        const authDataString = sessionStorage.getItem('auth_data');
        if (authDataString) {
          console.log('Found auth_data in sessionStorage during AuthContext initialization');
          try {
            const authData = JSON.parse(authDataString);
            
            // Restore token
            if (authData.t) localStorage.setItem('token', authData.t);
            
            // Restore user data
            if (authData.u) {
              const decodedUser = decodeURIComponent(atob(authData.u));
              localStorage.setItem('user', decodedUser);
            }
            
            // Restore auth flag
            if (authData.a) localStorage.setItem('isAuthenticated', authData.a);
            
            // Clean up
            sessionStorage.removeItem('auth_data');
            console.log('Auth data restored in AuthContext');
          } catch (e) {
            console.error('Error processing auth_data:', e);
          }
        }
        
        // Now proceed with normal auth check
        const storedUser = localStorage.getItem('user');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (isAuthenticated && storedUser) {
          // Parse stored user and map to our User type
          const userData = JSON.parse(storedUser);
          setUser({
            id: userData._id || userData.id, // Use _id from backend or id if already mapped
            email: userData.email,
            name: userData.name,
            role: userData.role === 'admin' ? 'admin' : userData.role === 'vendor' ? 'vendor' : 'user',
            photoURL: userData.photoURL,
            provider: userData.provider,
            token: userData.token
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear potentially corrupted auth data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Run initial check
    checkAuthStatus();
    
    // Add listener for storage events to handle auth state changes from other tabs/windows
    const handleStorageChange = (event) => {
      // React to relevant auth changes
      if (event.key === 'user' || event.key === 'isAuthenticated' || event.key === null) {
        console.log('Auth-related storage change detected, refreshing auth state');
        checkAuthStatus();
      }
    };
    
    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage event dispatched within the same window
    window.addEventListener('storageUpdate', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', checkAuthStatus);
    };
  }, []);

  // Login function
  const loginUser = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await login({ email, password });
      
      // Map response data to our User type
      const user = {
        id: userData._id || userData.id, // Support both _id (from MongoDB) and id formats
        name: userData.name,
        email: userData.email,
        role: userData.role === 'admin' ? 'admin' : userData.role === 'vendor' ? 'vendor' : 'user',
        token: userData.token
      };
      
      setUser(user);
      
      // Set authentication flag
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Determine redirect destination based on user role
      let redirectTo = '/';
      switch (user.role) {
        case 'admin':
          redirectTo = '/admin';
          break;
        case 'vendor':
          redirectTo = '/vendor/dashboard';
          break;
        default:
          redirectTo = '/';
      }
      
      return { success: true, redirectTo };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const registerUser = async (data: SignupData) => {
    try {
      setIsLoading(true);
      const userData = await register(data);
      const user = {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role === 'admin' ? 'admin' : userData.role === 'vendor' ? 'vendor' : 'user',
        token: userData.token
      };
      
      setUser(user);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Determine redirect destination based on user role
      let redirectTo = '/';
      switch (user.role) {
        case 'admin':
          redirectTo = '/admin';
          break;
        case 'vendor':
          redirectTo = '/vendor/dashboard';
          break;
        default:
          redirectTo = '/';
      }
      
      return { success: true, redirectTo };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  // Social login function
  const handleSocialLogin = async (provider: string, credential?: string) => {
    try {
      setIsLoading(true);
      const userData = await socialLogin(provider, credential);
      
      const user = {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role === 'admin' ? 'admin' : userData.role === 'vendor' ? 'vendor' : 'user',
        provider: userData.provider,
        photoURL: userData.photoURL,
        token: userData.token
      };
      
      setUser(user);
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Determine redirect destination based on user role
      let redirectTo = '/';
      switch (user.role) {
        case 'admin':
          redirectTo = '/admin';
          break;
        case 'vendor':
          redirectTo = '/vendor/dashboard';
          break;
        default:
          redirectTo = '/';
      }
      
      return { success: true, redirectTo };
    } catch (error) {
      console.error('Social login error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value
  const value = {
    user,
    isLoading,
    login: loginUser,
    signup: registerUser,
    logout: logoutUser,
    socialLogin: handleSocialLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};