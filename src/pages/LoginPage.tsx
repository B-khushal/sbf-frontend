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
import { useGmailLogin } from '@/hooks/use-gmail-login';

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
  const { triggerGoogleLogin, renderGoogleButton, isGoogleLoading } = useGmailLogin();
  
  // Get the redirect path from location state or default to '/'
  const redirectPath = location.state?.redirect || '/';
  const redirectMessage = location.state?.message;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Google authentication from redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isGoogleAuth = urlParams.get('google') === 'true';
    const googleCredential = sessionStorage.getItem('google_credential');
    
    if (isGoogleAuth && googleCredential) {
      handleGoogleCredential(googleCredential);
      // Clean up
      sessionStorage.removeItem('google_credential');
      sessionStorage.removeItem('google_auth_pending');
    }
  }, [location]);

  // Handle Google credential authentication
  const handleGoogleCredential = async (credential: string) => {
    try {
      setIsLoading(true);
      console.log("Processing Google credential");
      
      const success = await socialLogin('google', credential);
      
      if (success) {
        toast({
          title: "Welcome! 🌸",
          description: "You have successfully signed in with Google."
        });

        const role = localStorage.getItem('role');
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      } else {
        toast({
          title: "Sign-in failed",
          description: "Google sign-in failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      toast({
        title: "Sign-in failed",
        description: "An error occurred during Google sign-in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful");
        toast({
          title: "Welcome back! 🌸",
          description: "You have successfully logged in."
        });

        const role = localStorage.getItem('role');
        console.log("Stored role:", role);

        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>

      <Navigation cartItemCount={0} />
      
      <motion.main 
        className="relative flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen pt-24 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-md mx-auto"
        >
          {/* Welcome Header */}
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <div className="text-3xl">🌸</div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 pt-6">
                Welcome <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Back</span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sign in to your Spring Blossoms account and continue your floral journey
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-800">Sign In</h2>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleLogin(e);
              }} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    placeholder="your.email@example.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all"
                    required
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:text-secondary transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary transition-all pr-12"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </motion.button>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full h-14 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="w-5 h-5" />
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </div>
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

              {/* Google Login */}
              <motion.div
                className="w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full h-14 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                  onClick={triggerGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in with Google...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Sign In with Google
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
            
            {/* Footer */}
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 px-8 py-6 border-t border-white/20">
              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link 
                  to="/signup" 
                  state={{ redirect: redirectPath }}
                  className="text-primary hover:text-secondary font-semibold transition-colors"
                >
                  Sign up here
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            <motion.div 
              className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl mb-2">🛡️</div>
              <p className="text-sm font-medium text-gray-700">Secure Login</p>
            </motion.div>
            <motion.div 
              className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl mb-2">🚀</div>
              <p className="text-sm font-medium text-gray-700">Fast Access</p>
            </motion.div>
            <motion.div 
              className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl mb-2">🌸</div>
              <p className="text-sm font-medium text-gray-700">Floral Journey</p>
            </motion.div>
          </motion.div>

          {/* Back to Shop */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-8"
          >
            <Link 
              to="/shop"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Shop
            </Link>
          </motion.div>
        </motion.div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;