import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { checkAuthToken } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenChecking, setTokenChecking] = useState<boolean>(true);

  // Additional token validation for improved security
  useEffect(() => {
    const validateToken = async () => {
      try {
        if (user && user.token) {
          // For demo/development purpose - skip the server check if using mock tokens
          if (user.token.includes('mock')) {
            setTokenValid(true);
            setTokenChecking(false);
            return;
          }
          
          const isValid = await checkAuthToken();
          setTokenValid(isValid);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
      } finally {
        setTokenChecking(false);
      }
    };

    validateToken();
  }, [user]);

  // Show loading state while checking auth
  if (isLoading || tokenChecking) {
    // Check for auth data in sessionStorage (for post-payment recovery)
    const authDataString = sessionStorage.getItem('auth_data');
    if (authDataString) {
      try {
        console.log('Found auth_data in sessionStorage during ProtectedRoute check');
        const authData = JSON.parse(authDataString);
        
        // Restore auth data immediately
        if (authData.t) localStorage.setItem('token', authData.t);
        if (authData.u) {
          const decodedUser = decodeURIComponent(atob(authData.u));
          localStorage.setItem('user', decodedUser);
        }
        if (authData.a) localStorage.setItem('isAuthenticated', authData.a);
        
        // Clean up
        sessionStorage.removeItem('auth_data');
        console.log('Auth data restored in ProtectedRoute');
        
        // Force auth context refresh
        window.dispatchEvent(new Event('storageUpdate'));
        
        // Continue showing loading while context refreshes
      } catch (error) {
        console.error('Error restoring auth data in ProtectedRoute:', error);
      }
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Add a check to see if we're authenticated via localStorage even if user object is missing
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // Special case for confirmation page - bypass auth check if there's an order
  if (location.pathname === '/checkout/confirmation') {
    const hasOrder = localStorage.getItem('lastOrder') || sessionStorage.getItem('backup_order');
    if (hasOrder) {
      console.log('ProtectedRoute: Bypassing auth check for confirmation page with order');
      return <>{children}</>;
    }
  }
  
  // If token is invalid or user is not authenticated
  if ((!user && !isAuthenticated) || tokenValid === false) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role check is required and user doesn't have that role
  if (requiredRole && user && user.role !== requiredRole) {
    // Redirect to appropriate page based on role
    if (requiredRole === 'admin') {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
