import { useState, useCallback, useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export const useGmailLogin = () => {
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);
  const auth = useContext(AuthContext);

  // Handle Google OAuth response
  const handleGoogleResponse = useCallback(async (response: any) => {
    try {
      if (!auth || !response.credential) {
        console.error('Missing auth context or credential');
        return;
      }
      
      setIsGoogleLoading(true);
      const success = await auth.socialLogin('google', response.credential);
      
      if (success) {
        closeGmailDialog();
        localStorage.removeItem('google_popup_dismissed');
      }
    } catch (error) {
      console.error('Gmail login error:', error);
      // Don't retry automatically on error
    } finally {
      setIsGoogleLoading(false);
    }
  }, [auth]);

  // Initialize Google OAuth
  useEffect(() => {
    if (isGoogleInitialized) return; // Prevent re-initialization
    
    const initializeGoogleAuth = () => {
      // Don't initialize if no client ID is configured
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'your-google-client-id' || clientId === 'your-google-client-id-placeholder') {
        console.warn('Google OAuth not configured - skipping initialization');
        return;
      }

      try {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setIsGoogleInitialized(true);
          console.log('Google OAuth initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize Google OAuth:', error);
      }
    };

    // Load Google OAuth script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Failed to load Google OAuth script');
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, [handleGoogleResponse, isGoogleInitialized]);

  // Check if user should see the Google login popup
  useEffect(() => {
    const checkShouldShowPopup = () => {
      // Don't show if user is already logged in
      if (auth?.user) return false;

      // Check if popup was already shown in this session
      const popupShown = sessionStorage.getItem('google_popup_shown');
      if (popupShown) return false;

      // Check if user dismissed popup recently (within 24 hours)
      const dismissedTime = localStorage.getItem('google_popup_dismissed');
      if (dismissedTime) {
        const dismissedDate = new Date(dismissedTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff < 24) return false;
      }

      // Check if user has visited before (has any localStorage data)
      const hasVisitedBefore = localStorage.getItem('user') || 
                              localStorage.getItem('cart_guest') || 
                              localStorage.getItem('wishlist');
      
      // Show popup for new users or returning users who haven't seen it recently
      return !hasVisitedBefore || !dismissedTime;
    };

    // Show popup after a delay for better UX
    const timer = setTimeout(() => {
      if (checkShouldShowPopup() && isGoogleInitialized) {
        setIsGmailDialogOpen(true);
        sessionStorage.setItem('google_popup_shown', 'true');
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [auth?.user, isGoogleInitialized]);

  const openGmailDialog = useCallback(() => {
    setIsGmailDialogOpen(true);
    sessionStorage.setItem('google_popup_shown', 'true');
  }, []);

  const closeGmailDialog = useCallback(() => {
    setIsGmailDialogOpen(false);
    // Mark as dismissed for 24 hours
    localStorage.setItem('google_popup_dismissed', new Date().toISOString());
  }, []);

  const handleGmailLogin = useCallback(async () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'your-google-client-id' || clientId === 'your-google-client-id-placeholder') {
        console.warn('Google OAuth not configured');
        return;
      }

      if (!auth || !window.google || !isGoogleInitialized) {
        console.error('Google OAuth not available or not initialized');
        return;
      }
      
      setIsGoogleLoading(true);
      // Trigger Google OAuth popup
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Gmail login error:', error);
      setIsGoogleLoading(false);
    }
  }, [auth, isGoogleInitialized]);

  // Function to manually trigger popup (for buttons, etc.)
  const triggerGoogleLogin = useCallback(() => {
    if (!auth?.user) {
      openGmailDialog();
    }
  }, [auth?.user, openGmailDialog]);

  return {
    isGmailDialogOpen,
    openGmailDialog,
    closeGmailDialog,
    handleGmailLogin,
    triggerGoogleLogin,
    isGoogleLoading,
    isGoogleInitialized,
  };
}; 