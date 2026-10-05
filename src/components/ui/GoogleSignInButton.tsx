import React, { useRef, useCallback, memo, useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
  isLoginMode?: boolean;
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = memo(({
  onSuccess,
  onError,
  isLoginMode = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;

  const errorRef = useRef(onError);
  errorRef.current = onError;

  const [originUnavailable, setOriginUnavailable] = useState(false);

  const isLocalDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  // In local development, check if Google Identity Services iframe failed to mount (e.g. 403 Origin Not Allowed)
  useEffect(() => {
    if (!isLocalDev) return;

    const timer = setTimeout(() => {
      if (containerRef.current) {
        const iframe = containerRef.current.querySelector('iframe');
        // If no iframe loaded or iframe has 0 height/display:none, Google origin check failed
        if (!iframe || iframe.offsetHeight === 0) {
          setOriginUnavailable(true);
        }
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [isLocalDev]);

  const handleSuccess = useCallback((credentialResponse: any) => {
    successRef.current?.(credentialResponse);
  }, []);

  const handleError = useCallback(() => {
    console.warn('Google Sign-In button error or cancelled');
    if (isLocalDev) {
      setOriginUnavailable(true);
    }
    errorRef.current?.();
  }, [isLocalDev]);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div ref={containerRef} className="w-full max-w-[400px] min-h-[44px] flex flex-col items-center justify-center">
        {originUnavailable ? (
          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={() => {
                alert(
                  `Google Sign-In on localhost:\n\nGoogle requires "${currentOrigin}" to be added to "Authorized JavaScript origins" in Google Cloud Console.\n\nFor local testing, please sign in or register with Email & Password below.`
                );
              }}
              className="w-full h-11 flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-2 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.14C3.25 21.37 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.14z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.27 6.59l4.01 3.14c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 text-center leading-relaxed">
              <strong>Dev Note:</strong> <code className="bg-amber-100 px-1 rounded">{currentOrigin}</code> is not in Google Console origins. Please use <strong>Email & Password</strong> or add this origin in Google Cloud Console.
            </p>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            locale="en"
            width={400}
          />
        )}
      </div>
    </div>
  );
});

GoogleSignInButton.displayName = 'GoogleSignInButton';

export default GoogleSignInButton; 