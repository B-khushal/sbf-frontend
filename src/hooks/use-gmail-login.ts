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
  const auth = useContext(AuthContext);

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    // Load Google OAuth script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  // Handle Google OAuth response
  const handleGoogleResponse = useCallback(async (response: any) => {
    try {
      if (!auth || !response.credential) return;
      
      setIsGoogleLoading(true);
      const success = await auth.socialLogin('google', response.credential);
      
      if (success) {
        closeGmailDialog();
        localStorage.removeItem('google_popup_dismissed');
      }
    } catch (error) {
      console.error('Gmail login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [auth]);

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
      if (checkShouldShowPopup()) {
        setIsGmailDialogOpen(true);
        sessionStorage.setItem('google_popup_shown', 'true');
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [auth?.user]);

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
      if (!auth || !window.google) return;
      
      setIsGoogleLoading(true);
      // Trigger Google OAuth popup
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Gmail login error:', error);
      setIsGoogleLoading(false);
    }
  }, [auth]);

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
  };
}; 