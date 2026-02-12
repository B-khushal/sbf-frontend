import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
  isLoginMode?: boolean;
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  isLoginMode = true,
  className = ''
}) => {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="w-full max-w-[400px]">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={(error) => {
            console.warn('Google Sign-In error:', error);
            if (onError) onError();
          }}
          useOneTap={false}
          theme="outline"
          size="large"
          text={isLoginMode ? "signin_with" : "signup_with"}
          shape="rectangular"
          locale="en"
          width={400}
        />
      </div>
    </div>
  );
};

export default GoogleSignInButton; 