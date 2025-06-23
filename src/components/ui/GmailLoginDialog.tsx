import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { X, Mail, User, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GmailLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGmailLogin: () => void;
}

const GmailLoginDialog: React.FC<GmailLoginDialogProps> = ({
  isOpen,
  onClose,
  onGmailLogin,
}) => {
  // Mock Google accounts for demonstration (in real app, this would come from Google)
  const mockGoogleAccounts = [
    {
      id: 1,
      name: "Continue with Google",
      email: "Sign in with your Google account",
      avatar: "https://developers.google.com/identity/images/g-logo.png",
      isPrimary: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in to Spring Blossoms</DialogTitle>
          <DialogDescription>Choose an account to continue with Google authentication</DialogDescription>
        </DialogHeader>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="w-8 h-8"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">Sign in to Spring Blossoms</h2>
            <p className="text-blue-100 text-sm">Choose an account to continue</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Google Account Options */}
          <div className="space-y-3">
            {mockGoogleAccounts.map((account) => (
              <motion.button
                key={account.id}
                onClick={onGmailLogin}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-4 text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {account.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {account.email}
                  </p>
                </div>
                <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mt-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Why sign in with Google?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Secure and fast authentication
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Save your favorite flowers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Track orders easily
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Personalized recommendations
              </li>
            </ul>
          </div>

          {/* Browser Settings Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> If Google Sign-In doesn't work, please enable third-party cookies and sign-in permissions in your browser settings, or use the email option below.
            </p>
          </div>

          {/* Alternative Sign In */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              Or continue with email
            </p>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                // You can add navigation to login page here if needed
                window.location.href = '/login';
              }}
              className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <User className="w-4 h-4 mr-2" />
              Use Email Instead
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-gray-400 text-center pt-2">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-500 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GmailLoginDialog; 