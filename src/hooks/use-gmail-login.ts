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
          disableAutoSelect: () => void;
        };
      };
    };
    googleOAuthInitialized?: boolean;
  }
}

export const useGmailLogin = (autoPrompt: boolean = false) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);
  const auth = useContext(AuthContext);

  // Handle Google OAuth response
  const handleGoogleResponse = useCallback(async (response: any) => {
    try {
      if (!response.credential) {
        console.error('Missing credential in Google response');
        return;
      }
      
      setIsGoogleLoading(true);
      
      // Store the credential and redirect to login page for processing
      sessionStorage.setItem('google_credential', response.credential);
      sessionStorage.setItem('google_auth_pending', 'true');
      
      // Redirect to login page
      window.location.href = '/login?google=true';
      
    } catch (error) {
      console.error('Google authentication error:', error);
      setIsGoogleLoading(false);
    }
  }, []);

  // Initialize Google OAuth
  useEffect(() => {
    // Prevent multiple initializations across all component instances
    if (window.googleOAuthInitialized) {
      setIsGoogleInitialized(true);
      // If autoPrompt is enabled and we're already initialized, show the prompt
      if (autoPrompt) {
        setTimeout(() => {
          triggerGoogleLogin();
        }, 1000); // Small delay to ensure UI is ready
      }
      return;
    }
    
    const initializeGoogleAuth = () => {
      // Don't initialize if no client ID is configured
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'your-google-client-id' || clientId === 'your-google-client-id-placeholder') {
        console.warn('Google OAuth not configured - skipping initialization');
        return;
      }

      try {
        if (window.google && window.google.accounts && !window.googleOAuthInitialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
          });
          window.googleOAuthInitialized = true;
          setIsGoogleInitialized(true);
          console.log('Google OAuth initialized successfully');
          
          // Auto-prompt if enabled
          if (autoPrompt) {
            setTimeout(() => {
              triggerGoogleLogin();
            }, 1000); // Small delay to ensure UI is ready
          }
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
  }, [handleGoogleResponse, autoPrompt]);

  // Trigger Google Sign-In (this will show the account chooser)
  const triggerGoogleLogin = useCallback(() => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'your-google-client-id' || clientId === 'your-google-client-id-placeholder') {
        console.warn('Google OAuth not configured');
        // Redirect to regular login
        window.location.href = '/login';
        return;
      }

      if (!window.google || (!isGoogleInitialized && !window.googleOAuthInitialized)) {
        console.error('Google OAuth not available or not initialized');
        // Redirect to regular login as fallback
        window.location.href = '/login';
        return;
      }
      
      setIsGoogleLoading(true);
      
      // Show Google account chooser
      try {
        window.google.accounts.id.prompt();
      } catch (promptError) {
        console.warn('Google prompt failed, redirecting to login page:', promptError);
        // Redirect to login page as fallback
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Google login error:', error);
      // Redirect to login page as fallback
      window.location.href = '/login';
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isGoogleInitialized]);

  // Render Google Sign-In button
  const renderGoogleButton = useCallback((element: HTMLElement) => {
    if (!window.google || !window.google.accounts || (!isGoogleInitialized && !window.googleOAuthInitialized)) {
      return;
    }

    try {
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: '100%',
      });
    } catch (error) {
      console.error('Failed to render Google button:', error);
    }
  }, [isGoogleInitialized]);

  return {
    triggerGoogleLogin,
    renderGoogleButton,
    isGoogleLoading,
    isGoogleInitialized: isGoogleInitialized || window.googleOAuthInitialized,
  };
}; 