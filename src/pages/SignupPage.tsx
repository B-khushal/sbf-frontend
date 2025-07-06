import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Mail, Lock, Shield, Sparkles, Heart, CheckCircle, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';
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

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, socialLogin } = useAuth();
  const { toast } = useToast();
  
  // Get the redirect path from location state or default to '/'
  const redirectPath = location.state?.redirect || '/';
  const redirectMessage = location.state?.message;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Show redirect message if present
  useEffect(() => {
    if (redirectMessage) {
      toast({
        title: "Account Required",
        description: redirectMessage,
        variant: "default",
        duration: 4000,
      });
    }
  }, [redirectMessage, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      agreedToTerms: !!checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (result.success) {
        toast({
          title: "Welcome to Spring Blossoms! 🎉",
          description: "Your account has been created successfully!",
        });
        // Use the redirectTo from auth context or fall back to redirectPath
        navigate(result.redirectTo || redirectPath);
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error?.response?.data?.message || error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      console.log("Google signup credential:", credentialResponse);
      
      const result = await socialLogin('google', credentialResponse.credential);
      
      if (result.success) {
        toast({
          title: "Welcome to Spring Blossoms! 🎉",
          description: "Your account has been created successfully with Google!"
        });
        // Use the redirectTo from auth context or fall back to redirectPath
        navigate(result.redirectTo || redirectPath);
      } else {
        toast({
          title: "Signup failed",
          description: "Google signup failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast({
        title: "Signup failed",
        description: "An error occurred during Google signup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Signup failed",
      description: "Google signup was cancelled or failed",
      variant: "destructive"
    });
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
            Create your account
          </h2>
          <p className="text-sm text-gray-500">
            Join Spring Blossoms and start your floral journey
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <Label htmlFor="name" className="sr-only">Full Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-white/70 border-gray-200 focus:ring-primary/20 pl-10"
                  autoComplete="name"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white/70 border-gray-200 focus:ring-primary/20 pl-10"
                  autoComplete="email"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-white/70 border-gray-200 focus:ring-primary/20 pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

            {/* Confirm Password Input */}
            <div>
              <Label htmlFor="confirmPassword" className="sr-only">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-white/70 border-gray-200 focus:ring-primary/20 pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={handleCheckboxChange}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                Create Account <CheckCircle className="h-4 w-4" />
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

          {/* Google Signup */}
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

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default SignupPage;