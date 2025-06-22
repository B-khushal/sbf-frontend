import { useState, useCallback, useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useGmailLogin = () => {
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const auth = useContext(AuthContext);

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
      if (!auth) return;
      
      const success = await auth.socialLogin('google');
      
      if (success) {
        closeGmailDialog();
        // Clear dismissal flag on successful login
        localStorage.removeItem('google_popup_dismissed');
      }
    } catch (error) {
      console.error('Gmail login error:', error);
    }
  }, [auth, closeGmailDialog]);

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
  };
}; 