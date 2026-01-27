import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, UserPlus, Mail, Lock, ArrowRight, Sparkles, CheckCircle, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import Modal from '@/components/ui/Modal';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const formVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
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
  const { login, signup, socialLogin } = useAuth();
  const { toast } = useToast();
  
  const redirectPath = location.state?.redirect || '/';
  const redirectMessage = location.state?.message;
  
  const [isLoginMode, setIsLoginMode] = useState(!location.state?.signupMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Welcome back! 🌸",
          description: "You have successfully logged in."
        });
        navigate(result.redirectTo || redirectPath);
      } else {
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const signupResult = await signup({
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      });
      
      if (signupResult.success) {
        toast({
          title: "Welcome to Spring Blossoms! 🎉",
          description: "Your account has been created successfully!",
        });
        navigate(signupResult.redirectTo || redirectPath);
      } else {
        toast({
          title: "Registration failed",
          description: "Failed to create your account. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error?.response?.data?.message || error.message || "An error occurred while creating your account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      
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

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAgreedToTerms(false);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    clearForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-bloom-blue-200/20 via-transparent to-bloom-pink-200/20 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-bloom-green-200/20 via-transparent to-bloom-blue-200/20 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-bloom-pink-200/10 to-bloom-blue-200/10 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Side - Brand Section */}
          <motion.div 
            className="hidden lg:flex flex-col justify-center items-start space-y-8"
            variants={itemVariants}
          >
            <div className="space-y-6">
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-bloom-blue-400 to-bloom-pink-400 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-bloom-blue-600 to-bloom-pink-600 bg-clip-text text-transparent">
                  Spring Blossoms
                </h1>
              </motion.div>
              
              <motion.h2 
                className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Welcome to your
                <span className="block text-transparent bg-gradient-to-r from-bloom-blue-600 to-bloom-pink-600 bg-clip-text">
                  magical shopping
                </span>
                experience
              </motion.h2>
              
              <motion.p 
                className="text-lg text-gray-600 leading-relaxed max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Discover beautiful products, enjoy seamless shopping, and create wonderful memories with every purchase.
              </motion.p>
            </div>

            {/* Feature highlights */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-bloom-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-bloom-green-600" />
                </div>
                <span className="text-gray-700">Secure & Fast Checkout</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-bloom-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-bloom-blue-600" />
                </div>
                <span className="text-gray-700">Premium Customer Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-bloom-pink-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-bloom-pink-600" />
                </div>
                <span className="text-gray-700">Exclusive Offers & Rewards</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Form Section */}
          <motion.div 
            className="flex items-center justify-center"
            variants={formVariants}
          >
            <div className="w-full max-w-md">
              {/* Mobile Brand Section */}
              <motion.div 
                className="lg:hidden text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-bloom-blue-400 to-bloom-pink-400 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-bloom-blue-600 to-bloom-pink-600 bg-clip-text text-transparent">
                    Spring Blossoms
                  </h1>
                </div>
                <p className="text-gray-600 text-sm">
                  Welcome to your magical shopping experience
                </p>
              </motion.div>
              {/* Form Container */}
              <motion.div 
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {/* Mode Toggle */}
                <motion.div 
                  className="flex bg-gray-100 rounded-xl p-1 mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      isLoginMode 
                        ? 'bg-white text-bloom-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsLoginMode(false)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      !isLoginMode 
                        ? 'bg-white text-bloom-pink-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </div>
                  </button>
                </motion.div>

                {/* Form */}
                <AnimatePresence mode="wait">
                  {isLoginMode ? (
                    <motion.form
                      key="login"
                      onSubmit={handleLogin}
                      className="space-y-6"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 border-gray-200 focus:border-bloom-blue-400 focus:ring-bloom-blue-400/20"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-bloom-blue-400 focus:ring-bloom-blue-400/20"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Link 
                          to="/forgot-password" 
                          className="text-sm text-bloom-blue-600 hover:text-bloom-blue-700 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-bloom-blue-500 to-bloom-blue-600 hover:from-bloom-blue-600 hover:to-bloom-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup"
                      onSubmit={handleSignup}
                      className="space-y-6"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-12 border-gray-200 focus:border-bloom-pink-400 focus:ring-bloom-pink-400/20"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 border-gray-200 focus:border-bloom-pink-400 focus:ring-bloom-pink-400/20"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-bloom-pink-400 focus:ring-bloom-pink-400/20"
                            placeholder="Create a password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-bloom-pink-400 focus:ring-bloom-pink-400/20"
                            placeholder="Confirm your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                          className="mt-1"
                        />
                        <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                          I agree to the{" "}
                          <Link to="/terms" className="text-bloom-pink-600 hover:text-bloom-pink-700 underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy" className="text-bloom-pink-600 hover:text-bloom-pink-700 underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-bloom-pink-500 to-bloom-pink-600 hover:from-bloom-pink-600 hover:to-bloom-pink-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating account...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Create Account</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    isLoginMode={isLoginMode}
                  />
                </motion.div>

                {/* Footer Links */}
                <motion.div 
                  className="mt-8 text-center space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm text-gray-600">
                    {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={toggleMode}
                      className="text-bloom-blue-600 hover:text-bloom-blue-700 font-medium transition-colors"
                    >
                      {isLoginMode ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                  <Link 
                    to="/" 
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Back to home
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Terms Dialog */}
      <Modal
        isOpen={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              By creating an account with Google, you agree to our Terms of Service and Privacy Policy.
            </p>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dialog-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              />
              <Label htmlFor="dialog-terms" className="text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleTermsAccept}
                disabled={!agreedToTerms || isLoading}
                className="flex-1 bg-gradient-to-r from-bloom-blue-500 to-bloom-blue-600 hover:from-bloom-blue-600 hover:to-bloom-blue-700"
              >
                {isLoading ? "Creating Account..." : "Continue"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTermsDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;