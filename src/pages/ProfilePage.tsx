import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { updateUserProfile } from '@/services/authService';
import OrderHistory from '@/components/OrderHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit3, 
  Save, 
  X, 
  Package, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  LogOut, 
  Shield, 
  User, 
  Heart, 
  Settings,
  Bell,
  Star,
  Calendar,
  ArrowRight,
  CheckCircle,
  Mail,
  Lock
} from 'lucide-react';
import AddressManager from '@/components/AddressManager';
import { getOrders } from '@/services/orderService';
import { getUserReviews } from '@/services/reviewService';
import { getWishlist } from '@/services/wishlistService';
import { format } from 'date-fns';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
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

const fadeInVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'payments'>('profile');
  
  // Intersection observer for animations
  const [tabsRef, tabsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // Real data state
  const [userStats, setUserStats] = useState({
    orderCount: 0,
    wishlistCount: 0,
    reviewCount: 0,
    memberSince: ''
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch real user data
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      setIsLoadingStats(true);
      try {
        // Fetch orders count
        const orders = await getOrders();
        const orderCount = orders.length;
        
        // Fetch wishlist count
        let wishlistCount = 0;
        try {
          const wishlistResponse = await getWishlist();
          wishlistCount = wishlistResponse.wishlist.length;
        } catch (error) {
          console.log('No wishlist data available');
        }
        
        // Fetch reviews count
        let reviewCount = 0;
        try {
          const reviewsResponse = await getUserReviews();
          reviewCount = reviewsResponse.reviews.length;
        } catch (error) {
          console.log('No reviews data available');
        }
        
        // Get member since date from user data
        const memberSince = user.id ? '2024' : ''; // Default to 2024 if no specific date
        
        setUserStats({
          orderCount,
          wishlistCount,
          reviewCount,
          memberSince
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Set default values if there's an error
        setUserStats({
          orderCount: 0,
          wishlistCount: 0,
          reviewCount: 0,
          memberSince: '2024'
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchUserStats();
  }, [user]);
  
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your new passwords match"
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const profileData = {
        name: formData.name,
        email: formData.email,
      };
      
      if (formData.currentPassword && formData.newPassword) {
        Object.assign(profileData, {
          password: formData.newPassword,
          currentPassword: formData.currentPassword
        });
      }
      
      await updateUserProfile(profileData);
      
      toast({
        title: "Profile updated! 🎉",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again."
      });
      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (!user) {
    navigate('/login');
    return null;
  }

  const tabData = [
    { id: 'profile', label: 'Profile', icon: User, color: 'from-bloom-blue-500 to-bloom-blue-600' },
    { id: 'orders', label: 'Orders', icon: Package, color: 'from-bloom-pink-500 to-bloom-pink-600' },
    { id: 'addresses', label: 'Addresses', icon: MapPin, color: 'from-bloom-green-500 to-bloom-green-600' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-purple-500 to-purple-600' },
  ];
  
  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OrderHistory />
          </motion.div>
        );
      case 'addresses':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AddressManager />
          </motion.div>
        );
      case 'payments':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Payment Methods</h3>
            <p className="text-gray-600 text-lg">Payment methods management coming soon</p>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-bloom-blue-500 to-bloom-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="pl-10 h-12 border-gray-200 focus:border-bloom-blue-400 focus:ring-bloom-blue-400/20 disabled:bg-gray-50"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-2"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="pl-10 h-12 border-gray-200 focus:border-bloom-blue-400 focus:ring-bloom-blue-400/20 disabled:bg-gray-50"
                        placeholder="Enter your email"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Password Change Section */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 pt-8 space-y-6"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <motion.div 
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 block">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="pl-10 h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
                            placeholder="Enter current password"
                          />
                        </div>
                      </motion.div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div 
                          className="space-y-2"
                          whileFocus={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 block">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="pl-10 h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
                              placeholder="Enter new password"
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          whileFocus={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="pl-10 h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {!isEditing ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-bloom-blue-500 to-bloom-blue-600 hover:from-bloom-blue-600 hover:to-bloom-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-bloom-green-500 to-bloom-green-600 hover:from-bloom-green-600 hover:to-bloom-green-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {isUpdating ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(prev => ({
                            ...prev,
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          }));
                        }}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:text-red-600 transition-all"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-blue-50 via-bloom-pink-50 to-bloom-green-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-bloom-blue-200/20 via-transparent to-bloom-pink-200/20 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-bloom-green-200/20 via-transparent to-bloom-blue-200/20 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-bloom-pink-200/10 to-bloom-blue-200/10 rounded-full blur-2xl animate-pulse" />
      </div>

      <Navigation cartItemCount={0} />
      
      <motion.main 
        className="relative flex-1 pt-20 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Profile Header */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 mb-8"
            variants={itemVariants}
          >
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Avatar Section */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-bloom-blue-500 to-bloom-pink-500 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-bloom-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.div>
              
              {/* User Info */}
              <div className="flex-1 text-center lg:text-left min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 break-words">
                  Welcome back, <span className="bg-gradient-to-r from-bloom-blue-600 to-bloom-pink-600 bg-clip-text text-transparent">{user.name}!</span>
                </h1>
                <p className="text-gray-600 text-base sm:text-lg mb-4 break-all">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <div className="px-3 py-1.5 bg-bloom-green-100 rounded-full">
                    <span className="text-sm font-medium text-bloom-green-700">✓ Verified Account</span>
                  </div>
                  <div className="px-3 py-1.5 bg-bloom-blue-100 rounded-full">
                    <span className="text-sm font-medium text-bloom-blue-700">🌸 Flower Lover</span>
                  </div>
                </div>
              </div>
              
              {/* Logout Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-full lg:w-auto"
              >
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full lg:w-auto px-6 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  {isLoadingStats ? (
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800">{userStats.orderCount}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-bloom-blue-500 to-bloom-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                  {isLoadingStats ? (
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800">{userStats.wishlistCount}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-bloom-pink-500 to-bloom-pink-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  {isLoadingStats ? (
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800">{userStats.reviewCount}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-bloom-green-500 to-bloom-green-600 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  {isLoadingStats ? (
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800">{userStats.memberSince}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            ref={tabsRef}
            initial="hidden"
            animate={tabsInView ? "visible" : "hidden"}
            variants={fadeInVariants}
          >
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-md rounded-xl p-2 mb-8 border border-white/20 gap-2">
                {tabData.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`rounded-lg data-[state=active]:bg-gradient-to-r ${tab.color} data-[state=active]:text-white font-medium transition-all duration-300 py-3 text-sm`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.substring(0, 4)}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
                <TabsContent value="profile" className="mt-0">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-bloom-blue-500 to-bloom-blue-600 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                  </div>
                  {renderContent()}
                </TabsContent>

                <TabsContent value="orders" className="mt-0">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-bloom-pink-500 to-bloom-pink-600 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
                  </div>
                  {renderContent()}
                </TabsContent>

                <TabsContent value="addresses" className="mt-0">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-bloom-green-500 to-bloom-green-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Delivery Addresses</h2>
                  </div>
                  {renderContent()}
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Payment Methods</h2>
                  </div>
                  {renderContent()}
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          >
            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/wishlist')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-bloom-pink-500 to-bloom-pink-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">My Wishlist</h3>
              <p className="text-sm text-gray-600 mb-4">View your saved favorites and create new collections</p>
              <div className="text-sm text-bloom-pink-600 font-medium">
                {isLoadingStats ? 'Loading...' : `${userStats.wishlistCount} items saved`}
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab('orders')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-bloom-blue-500 to-bloom-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Recent Orders</h3>
              <p className="text-sm text-gray-600 mb-4">Track your recent purchases and order status</p>
              <div className="text-sm text-bloom-blue-600 font-medium">
                {isLoadingStats ? 'Loading...' : `${userStats.orderCount} orders total`}
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group sm:col-span-2 lg:col-span-1"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/shop')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-bloom-green-500 to-bloom-green-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Explore Shop</h3>
              <p className="text-sm text-gray-600 mb-4">Discover new arrangements and seasonal collections</p>
              <div className="text-sm text-bloom-green-600 font-medium">New arrivals available</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage; 