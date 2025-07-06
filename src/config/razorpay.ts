// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Live credentials from environment variables (replace test fallbacks with your live keys)
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_D9vJLrTA4TaxBf',
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'lZEQbuduY11quBXY0JAkUHnj',
  
  // Business information
  businessName: 'Deepak Kumar Badodhe',
  businessDescription: 'Flower Delivery Service',
  logoUrl: 'https://via.placeholder.com/256x256/10B981/FFFFFF?text=DK', // Temporary placeholder logo
  
  // Alternative logo URLs if placeholder doesn't work
  logoUrlFallback: 'https://via.placeholder.com/256x256/10B981/FFFFFF?text=DK',
  logoUrlBackup: 'https://via.placeholder.com/256x256/10B981/FFFFFF?text=Deepak',
  
  // Function to get a working logo URL
  getLogoUrl: () => {
    // Use a more reliable logo URL to avoid EMPTY_WORDMARK error
    // Using a data URL as fallback to ensure it always works
    const logoUrls = [
      'https://via.placeholder.com/256x256/10B981/FFFFFF?text=DK',
      'https://via.placeholder.com/256x256/10B981/FFFFFF?text=Deepak',
      'https://via.placeholder.com/256x256/10B981/FFFFFF?text=Flowers',
      'https://via.placeholder.com/256x256/10B981/FFFFFF?text=DKF',
      // Data URL as ultimate fallback
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjMTBCOTgxIi8+Cjx0ZXh0IHg9IjEyOCIgeT0iMTQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+REs8L3RleHQ+Cjwvc3ZnPgo='
    ];
    
    // Return a random logo URL to avoid caching issues
    return logoUrls[Math.floor(Math.random() * logoUrls.length)];
  },
  
  // Configuration options
  currency: 'INR',
  timeout: 120, // 2 minutes
  themeColor: '#10B981', // Green color for success
  
  // Validation functions
  isValidKeyId: (keyId: string): boolean => {
    return /^rzp_(test|live)_[A-Za-z0-9]{14}$/.test(keyId);
  },
  
  isValidKeySecret: (keySecret: string): boolean => {
    return /^[A-Za-z0-9]{20,}$/.test(keySecret);
  },
  
  // Check if using live credentials
  isLiveMode: (): boolean => {
    return RAZORPAY_CONFIG.keyId.startsWith('rzp_live_');
  },
  
  // Get validated config
  getValidatedConfig: () => {
    const keyId = RAZORPAY_CONFIG.keyId;
    const keySecret = RAZORPAY_CONFIG.keySecret;
    
    const keyIdValid = RAZORPAY_CONFIG.isValidKeyId(keyId);
    const keySecretValid = RAZORPAY_CONFIG.isValidKeySecret(keySecret);
    const isLive = RAZORPAY_CONFIG.isLiveMode();
    
    if (!keyIdValid) {
      console.error('❌ Invalid Razorpay Key ID format:', keyId);
    }
    
    if (!keySecretValid) {
      console.error('❌ Invalid Razorpay Key Secret format');
    }
    
    console.log('🔧 Razorpay Configuration:', {
      keyId,
      keyIdValid,
      keySecretValid,
      isLive,
      mode: isLive ? 'LIVE' : 'TEST',
      environment: import.meta.env.MODE || 'development'
    });
    
    if (isLive) {
      console.log('🔴 LIVE MODE: Real payments will be processed!');
    } else {
      console.log('🟡 TEST MODE: No real money will be charged');
    }
    
    return {
      keyId,
      keySecret,
      isValid: keyIdValid && keySecretValid,
      isLive,
      currency: RAZORPAY_CONFIG.currency,
      timeout: RAZORPAY_CONFIG.timeout
    };
  }
};

// Export for use in components
export default RAZORPAY_CONFIG;

// Environment check
if (import.meta.env.DEV) {
  const config = RAZORPAY_CONFIG.getValidatedConfig();
  console.log('🔧 Development Razorpay Check:', {
    keyId: config.keyId,
    isValid: config.isValid,
    isLive: config.isLive,
    environment: import.meta.env.MODE
  });
} 