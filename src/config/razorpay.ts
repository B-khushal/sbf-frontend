// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Updated with newest credentials from user
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_eGFXvmTuCZJo3Z',
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'NUAqe6xx4c5aHQNYDb6YdaDF',
  
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
  
  // Get validated config
  getValidatedConfig: () => {
    const keyId = RAZORPAY_CONFIG.keyId;
    const keySecret = RAZORPAY_CONFIG.keySecret;
    
    const keyIdValid = RAZORPAY_CONFIG.isValidKeyId(keyId);
    const keySecretValid = RAZORPAY_CONFIG.isValidKeySecret(keySecret);
    
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
      environment: import.meta.env.MODE || 'development'
    });
    
    return {
      keyId,
      keySecret,
      isValid: keyIdValid && keySecretValid,
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
    environment: import.meta.env.MODE
  });
} 