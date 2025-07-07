import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LogIn, ShoppingCart, Heart } from 'lucide-react';

interface AuthCheckProps {
  children: React.ReactNode;
  action: 'cart' | 'wishlist' | 'general';
  fallback?: React.ReactNode;
  showPrompt?: boolean;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ 
  children, 
  action, 
  fallback,
  showPrompt = true 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getActionText = () => {
    switch (action) {
      case 'cart':
        return {
          title: 'Add to Cart',
          description: 'Please log in to add items to your cart',
          icon: <ShoppingCart className="w-4 h-4" />
        };
      case 'wishlist':
        return {
          title: 'Add to Wishlist',
          description: 'Please log in to save items to your wishlist',
          icon: <Heart className="w-4 h-4" />
        };
      default:
        return {
          title: 'Authentication Required',
          description: 'Please log in to continue',
          icon: <LogIn className="w-4 h-4" />
        };
    }
  };

  const handleLoginRedirect = () => {
    const actionText = getActionText();
    
    if (showPrompt) {
      toast({
        title: actionText.title,
        description: actionText.description,
        variant: "destructive",
        duration: 3000,
      });
    }

    setTimeout(() => {
      navigate('/login', { 
        state: { 
          redirect: window.location.pathname,
          message: actionText.description
        } 
      });
    }, showPrompt ? 1500 : 0);
  };

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showPrompt) {
      return (
        <div className="flex items-center justify-center p-4">
          <Button 
            onClick={handleLoginRedirect}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white"
          >
            {getActionText().icon}
            Login to Continue
          </Button>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

export default AuthCheck; 