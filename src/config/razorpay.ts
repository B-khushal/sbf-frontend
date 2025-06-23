// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Update this with your new Razorpay key ID
  KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_OH8BIkxm62f30M',
  
  // Default options for Razorpay checkout
  DEFAULT_OPTIONS: {
    name: 'SBF Store',
    theme: {
      color: '#000000'
    },
    modal: {
      confirm_close: true,
      ondismiss: () => {
        console.log('Razorpay checkout dismissed');
      }
    }
  },
  
  // Validation function for key format
  isValidKey: (key: string): boolean => {
    return key.startsWith('rzp_') && key.length > 10;
  },
  
  // Get the current key with validation
  getKey: (): string => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_OH8BIkxm62f30M';
    
    if (!RAZORPAY_CONFIG.isValidKey(key)) {
      console.warn('⚠️ Invalid Razorpay key format detected:', key);
    }
    
    return key;
  }
};

// Environment check
if (import.meta.env.DEV) {
  console.log('🔧 Razorpay Configuration:', {
    keyId: RAZORPAY_CONFIG.getKey(),
    isValid: RAZORPAY_CONFIG.isValidKey(RAZORPAY_CONFIG.getKey()),
    environment: import.meta.env.MODE
  });
} 