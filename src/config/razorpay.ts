// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Live credentials from environment variables (replace test fallbacks with your live keys)
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SyHCsl7NYNB7JB',
  
  // Configuration options
  currency: 'INR',
  timeout: 120, // 2 minutes
  
  // Validation functions
  isValidKeyId: (keyId: string): boolean => {
    return /^rzp_(test|live)_[A-Za-z0-9]{14}$/.test(keyId);
  },
  
  // Check if using live credentials
  isLiveMode: (): boolean => {
    return RAZORPAY_CONFIG.keyId.startsWith('rzp_live_');
  },
  
  // Get validated config
  getValidatedConfig: () => {
    const keyId = RAZORPAY_CONFIG.keyId;
    const keyIdValid = RAZORPAY_CONFIG.isValidKeyId(keyId);
    const isLive = RAZORPAY_CONFIG.isLiveMode();
    
    if (!keyIdValid) {
      console.error('❌ Invalid Razorpay Key ID format:', keyId);
    }
    
    console.log('🔧 Razorpay Configuration:', {
      keyId,
      keyIdValid,
      isLive,
      mode: isLive ? 'LIVE' : 'TEST',
      environment: import.meta.env.MODE || 'development'
    });
    
    if (isLive) {
      console.log('🔴 LIVE MODE: Real payments will be processed!');
    }
    
    return {
      keyId,
      isValid: keyIdValid,
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