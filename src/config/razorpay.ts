// Razorpay Configuration - Development Mode
export const RAZORPAY_CONFIG = {
  // TEST MODE credentials for development (DO NOT use live keys in development)
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SAMPLE_KEY',
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'sample_secret',
  
  // Configuration options
  currency: 'INR',
  timeout: 120, // 2 minutes
  
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
    
    // Warning for development mode
    if (import.meta.env.MODE === 'development' && isLive) {
      console.warn('⚠️ WARNING: Using LIVE Razorpay keys in development mode!');
      console.warn('⚠️ Please switch to TEST mode keys for local development.');
    }
    
    if (!isLive && import.meta.env.MODE === 'development') {
      console.log('✅ Using TEST mode - Safe for development');
    }
    
    if (isLive) {
      console.log('🔴 LIVE MODE: Real payments will be processed!');
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