// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Live credentials from environment variables (replace test fallbacks with your live keys)
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_D9vJLrTA4TaxBf',
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'lZEQbuduY11quBXY0JAkUHnj',
  
  // Configuration options
  currency: 'INR',
  timeout: 120, // 2 minutes
  themeColor: '#10B981', // Green color for theme
  
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
      timeout: RAZORPAY_CONFIG.timeout,
      themeColor: RAZORPAY_CONFIG.themeColor
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