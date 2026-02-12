import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  login as loginService, 
  register as registerService, 
  logout, 
  socialLogin, 
  getUserProfile, 
  updateUserProfile 
} from '@/services/authService';

// Define types for our authentication context
type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'vendor';
  photoURL?: string;
  provider?: string;
  token?: string;
  vendorStatus?: 'pending' | 'approved' | 'suspended' | 'rejected';
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
  socialLogin: (provider: string, credential?: string, agreedToTerms?: boolean) => Promise<{ success: boolean; redirectTo?: string; isNewUser?: boolean }>;
  refreshAuth: () => Promise<void>;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
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
        
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');

        if (isAuthenticated && token) {
          // If authenticated, try to fetch the latest user profile
          // but fall back to stored data if the API call fails
          try {
            const profileData = await getUserProfile();
            const user = {
              id: profileData._id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role,
              vendorStatus: profileData.vendorStatus,
              photoURL: profileData.photoURL,
              provider: profileData.provider,
              token: token,
            };
            setUser(user);
            // Also update localStorage with the fresh data
            localStorage.setItem('user', JSON.stringify(profileData));
          } catch (fetchError) {
            console.warn('Failed to fetch user profile, using stored data:', fetchError);
            
            // Instead of logging out, try to use stored user data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                const user = {
                  id: parsedUser._id || parsedUser.id,
                  name: parsedUser.name,
                  email: parsedUser.email,
                  role: parsedUser.role,
                  vendorStatus: parsedUser.vendorStatus,
                  photoURL: parsedUser.photoURL,
                  provider: parsedUser.provider,
                  token: token,
                };
                setUser(user);
                console.log('Using stored user data as fallback:', user);
              } catch (parseError) {
                console.error('Failed to parse stored user data:', parseError);
                // Only logout if we can't even parse the stored data
                logout();
              }
            } else {
              console.error('No stored user data available, logging out');
              logout();
            }
          }
        } else {
            // If not authenticated, ensure user state is null
            setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear potentially corrupted auth data
        logout();
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
    window.addEventListener('storageUpdate', checkAuthStatus as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', checkAuthStatus as EventListener);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const loginResponse = await loginService({ email, password });
      
      // After successful login, get the full user profile
      const profileData = await getUserProfile();
      
      const user = {
        id: profileData._id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        vendorStatus: profileData.vendorStatus,
        token: loginResponse.token
      };
      
      setUser(user);
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(profileData));
      localStorage.setItem('token', loginResponse.token); // Also store the token separately
      
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
  const signup = async (data: SignupData) => {
    try {
      setIsLoading(true);
      const registerResponse = await registerService(data);
      const profileData = await getUserProfile();

      const user = {
        id: profileData._id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        vendorStatus: profileData.vendorStatus,
        token: registerResponse.token
      };
      
      setUser(user);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(profileData));
      localStorage.setItem('token', registerResponse.token); // Also store the token separately
      
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
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token'); // Also remove the token
  };

  // Refresh authentication status
  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      await checkAuthStatus();
    } catch (error) {
      console.error('Error refreshing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Social login function
  const handleSocialLogin = async (provider: string, credential?: string, agreedToTerms?: boolean) => {
    try {
      setIsLoading(true);
      const socialLoginResponse = await socialLogin(provider, credential, agreedToTerms);
      
      // If this is a new user and they haven't accepted terms yet
      if (socialLoginResponse.isNewUser && !agreedToTerms) {
        return { success: false, isNewUser: true };
      }
      
      const profileData = await getUserProfile();
      
      const user = {
        id: profileData._id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        vendorStatus: profileData.vendorStatus,
        provider: profileData.provider,
        photoURL: profileData.photoURL,
        token: socialLoginResponse.token
      };
      
      setUser(user);
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(profileData));
      localStorage.setItem('token', socialLoginResponse.token);
      
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
    login,
    signup,
    logout,
    socialLogin: handleSocialLogin,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};