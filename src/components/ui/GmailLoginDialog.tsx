import React from 'react';
import { 
  EnhancedContextualDialog, 
  EnhancedContextualDialogContent, 
  EnhancedContextualDialogHeader, 
  EnhancedContextualDialogTitle, 
  EnhancedContextualDialogDescription 
} from './enhanced-contextual-dialog';
import { Button } from './button';
import { Mail } from 'lucide-react';

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
  return (
    <EnhancedContextualDialog open={isOpen} onOpenChange={onClose}>
      <EnhancedContextualDialogContent className="sm:max-w-[425px]">
        <EnhancedContextualDialogHeader>
          <EnhancedContextualDialogTitle className="text-2xl font-bold text-center">
            Sign in with Gmail
          </EnhancedContextualDialogTitle>
          <EnhancedContextualDialogDescription className="text-center pt-2">
            Join our community to access exclusive features and personalized shopping experience
          </EnhancedContextualDialogDescription>
        </EnhancedContextualDialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Gmail Logo and Text */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <Mail className="w-8 h-8 text-red-500" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Why Sign In?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Track your orders easily</li>
              <li>• Save your favorite items</li>
              <li>• Get personalized recommendations</li>
              <li>• Faster checkout process</li>
            </ul>
          </div>

          {/* Gmail Sign In Button */}
          <Button
            onClick={onGmailLogin}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-6 rounded-xl flex items-center justify-center gap-3 text-lg font-medium transition-all duration-300"
          >
            <Mail className="w-6 h-6" />
            Continue with Gmail
          </Button>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center max-w-[300px]">
            By continuing, you agree to our Terms of Service and Privacy Policy. We'll never post without your permission.
          </p>
        </div>
      </EnhancedContextualDialogContent>
    </EnhancedContextualDialog>
  );
};

export default GmailLoginDialog; 