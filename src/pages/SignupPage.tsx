import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Mail, Lock, Shield, Sparkles, Heart, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';

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
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      toast({
        title: "Welcome to Spring Blossoms! 🎉",
        description: "Your account has been created successfully!",
      });
      navigate('/');
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
      
      const success = await socialLogin('google', credentialResponse.credential);
      
      if (success) {
        toast({
          title: "Welcome to Spring Blossoms! 🎉",
          description: "Your account has been created successfully with Google!"
        });
        navigate(redirectPath);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>

      <Navigation cartItemCount={0} />
      
      <motion.main 
        className="relative flex-1 pt-24 pb-12 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Header */}
            <motion.div 
              variants={itemVariants}
              className="text-center mb-12"
            >
              <div className="relative mb-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 leading-tight">
                  Join <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Spring Blossoms</span>
                </h1>
                <div className="absolute -top-2 -right-4 text-2xl">🌺</div>
                <div className="absolute -bottom-2 -left-4 text-2xl">🌸</div>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Create your account and discover a world of beautiful floral arrangements
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Signup Form */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-800 mb-2">Create Account</h2>
                  <p className="text-gray-600">Enter your information to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <Input 
                      id="name" 
                      placeholder="Your Full Name" 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <Input 
                      id="email" 
                      placeholder="name@example.com" 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Lock className="w-4 h-4" />
                      Create Password
                    </label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all pr-12"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Shield className="w-4 h-4" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all pr-12"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start space-x-3"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleCheckboxChange(checked === true)}
                      required
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary font-semibold hover:underline">
                        Terms and Conditions
                      </Link>
                      {" "}and{" "}
                      <Link to="/privacy" className="text-primary font-semibold hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent text-white rounded-2xl hover:shadow-lg transition-all duration-300" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating account...
                        </div>
                      ) : (
                        "Create account"
                                          )}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Signup */}
              <motion.div
                className="w-full mb-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="signup_with"
                  shape="rectangular"
                />
              </motion.div>

              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
              </motion.div>

              {/* Feature Highlights */}
              <motion.div 
                variants={itemVariants}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-gray-800 mb-4">Why Join Spring Blossoms?</h3>
                  <p className="text-gray-600">Discover the benefits of being part of our community</p>
                </div>

                <div className="space-y-4">
                  <motion.div 
                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">Easy Account Management</h4>
                        <p className="text-gray-600 text-sm">Track orders, manage addresses, and update preferences all in one place.</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">Personalized Experience</h4>
                        <p className="text-gray-600 text-sm">Save favorites, get recommendations, and enjoy a tailored shopping experience.</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">Exclusive Benefits</h4>
                        <p className="text-gray-600 text-sm">Get early access to new collections and special member-only discounts.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Back to Shop */}
                <motion.div 
                  className="text-center pt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/shop" 
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                  >
                    🛍️ Browse our collection first
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default SignupPage;