import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
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
import { Edit3, Save, X, Package, MapPin, CreditCard, Sparkles, LogOut, Shield, User, Heart } from 'lucide-react';
import AddressManager from '@/components/AddressManager';

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
      duration: 0.5,
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
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
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
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payments', icon: CreditCard },
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
            className="text-center py-12 sm:py-16"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Payment Methods</h3>
            <p className="text-gray-600 text-base sm:text-lg px-4">Payment methods management coming soon</p>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <motion.div 
                  className="space-y-2"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700 block">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-primary transition-all disabled:bg-gray-50 text-sm sm:text-base"
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-primary transition-all disabled:bg-gray-50 text-sm sm:text-base"
                  />
                </motion.div>
              </div>
              
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 pt-6 sm:pt-8 space-y-4 sm:space-y-6"
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-400 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Change Password</h3>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <motion.div 
                      className="space-y-2"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700 block">
                        Current Password
                      </label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-primary transition-all text-sm sm:text-base"
                      />
                    </motion.div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <motion.div 
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 block">
                          New Password
                        </label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-primary transition-all text-sm sm:text-base"
                        />
                      </motion.div>
                      
                      <motion.div 
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 block">
                          Confirm New Password
                        </label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-primary transition-all text-sm sm:text-base"
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                {!isEditing ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                      >
                        {isUpdating ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-red-400 hover:text-red-600 transition-all text-sm sm:text-base"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl animate-reverse-spin" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-secondary/3 to-accent/3 rounded-full blur-2xl animate-pulse" />
      </div>

      <Navigation cartItemCount={0} />
      
      <motion.main 
        className="relative flex-1 pt-20 sm:pt-24 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section 
          variants={itemVariants}
          className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
        >
          <div className="max-w-7xl mx-auto">
            {/* Profile Header */}
            <motion.div 
              className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
              variants={itemVariants}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-2 break-words">
                    Welcome back, <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{user.name}!</span>
                  </h1>
                  <p className="text-gray-600 text-base sm:text-lg mb-4 break-all">{user.email}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                      <span className="text-xs sm:text-sm font-semibold text-green-700">✓ Verified Account</span>
                    </div>
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                      <span className="text-xs sm:text-sm font-semibold text-blue-700">🌸 Flower Lover</span>
                    </div>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0"
                >
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 transition-all text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              ref={tabsRef}
              initial="hidden"
              animate={tabsInView ? "visible" : "hidden"}
              variants={fadeInVariants}
            >
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 mb-6 sm:mb-8 border border-white/20 gap-1">
                  {tabData.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white font-semibold transition-all duration-300 py-2 sm:py-3 text-xs sm:text-sm"
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline">{tab.label}</span>
                        <span className="xs:hidden">{tab.label.substring(0, 4)}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8">
                  <TabsContent value="profile" className="mt-0">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-800">Profile Information</h2>
                    </div>
                    {renderContent()}
                  </TabsContent>

                  <TabsContent value="orders" className="mt-0">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-800">Order History</h2>
                    </div>
                    {renderContent()}
                  </TabsContent>

                  <TabsContent value="addresses" className="mt-0">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-800">Delivery Addresses</h2>
                    </div>
                    {renderContent()}
                  </TabsContent>

                  <TabsContent value="payments" className="mt-0">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-800">Payment Methods</h2>
                    </div>
                    {renderContent()}
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8"
            >
              <motion.div 
                className="bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 text-center hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">My Wishlist</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">View your saved favorites</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/wishlist')}
                  className="rounded-lg sm:rounded-xl w-full text-xs sm:text-sm"
                >
                  View Wishlist
                </Button>
              </motion.div>

              <motion.div 
                className="bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 text-center hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Recent Orders</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Track your recent purchases</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  className="rounded-lg sm:rounded-xl w-full text-xs sm:text-sm"
                >
                  View Orders
                </Button>
              </motion.div>

              <motion.div 
                className="bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 text-center hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Explore Shop</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Discover new arrangements</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/shop')}
                  className="rounded-lg sm:rounded-xl w-full text-xs sm:text-sm"
                >
                  Shop Now
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage; 