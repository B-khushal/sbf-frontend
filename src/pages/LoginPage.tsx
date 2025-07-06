import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';
import { Checkbox } from '@/components/ui/checkbox';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin } = useAuth();
  const { toast } = useToast();
  
  // Get the redirect path from location state or default to '/'
  const redirectPath = location.state?.redirect || '/';
  const redirectMessage = location.state?.message;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [tempGoogleCredential, setTempGoogleCredential] = useState<any>(null);

  // Show redirect message if present
  useEffect(() => {
    if (redirectMessage) {
      toast({
        title: "Login Required",
        description: redirectMessage,
        variant: "default",
        duration: 4000,
      });
    }
  }, [redirectMessage, toast]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to login with:", { email });
      const result = await login(email, password);
      
      if (result.success) {
        console.log("Login successful");
        toast({
          title: "Welcome back! 🌸",
          description: "You have successfully logged in."
        });

        // Use the redirectTo from auth context or fall back to redirectPath
        navigate(result.redirectTo || redirectPath);
      } else {
        console.log("Login failed");
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      console.log("Google login credential:", credentialResponse);
      
      const result = await socialLogin('google', credentialResponse.credential);
      
      if (result.isNewUser) {
        setTempGoogleCredential(credentialResponse.credential);
        setShowTermsDialog(true);
        setIsLoading(false);
        return;
      }
      
      if (result.success) {
        toast({
          title: "Welcome back! 🌸",
          description: "You have successfully logged in with Google."
        });

        // Use the redirectTo from auth context or fall back to redirectPath
        navigate(result.redirectTo || redirectPath);
      } else {
        toast({
          title: "Login failed",
          description: "Google login failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during Google login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Login failed",
      description: "Google login was cancelled or failed",
      variant: "destructive"
    });
  };

  const handleTermsAccept = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await socialLogin('google', tempGoogleCredential, agreedToTerms);
      
      if (result.success) {
        setShowTermsDialog(false);
        toast({
          title: "Welcome to Spring Blossoms! 🌸",
          description: "Your account has been created successfully!"
        });
        navigate(result.redirectTo || redirectPath);
      } else {
        toast({
          title: "Registration failed",
          description: "Failed to create your account. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Terms acceptance error:", error);
      toast({
        title: "Registration failed",
        description: "An error occurred while creating your account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8 relative"
      >
        {/* Logo and Title */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.form variants={itemVariants} onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/70 border-gray-200 focus:ring-primary/20"
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/70 border-gray-200 focus:ring-primary/20 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-200 py-6"
          >
            {isLoading ? (
              <motion.div
                className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
              />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign in <LogIn className="h-4 w-4" />
              </span>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-white to-gray-50/50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="pill"
              size="large"
              text="continue_with"
              useOneTap
            />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </motion.form>
      </motion.div>

      {/* Terms Dialog */}
      <Modal
        isOpen={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        title="Accept Terms & Conditions"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please accept our Terms of Service and Privacy Policy to continue.
          </p>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <Link
                to="/terms"
                className="text-primary hover:text-primary/80"
                target="_blank"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary/80"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTermsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTermsAccept}
              disabled={!agreedToTerms || isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;