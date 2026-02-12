/**
 * Wake-up service to prevent backend from sleeping
 * This service pings the backend periodically to keep it active
 */

import axios from 'axios';

const BACKEND_URL = 'https://www.sbflorist.in';
const WAKE_UP_INTERVAL = 14 * 60 * 1000; // 14 minutes (before 15-minute sleep threshold)

let wakeUpInterval: NodeJS.Timeout | null = null;
let isWakeUpActive = false;

// Wake up the backend server
const wakeUpBackend = async (): Promise<boolean> => {
  try {
    console.log('⏰ Pinging backend to prevent sleep...');
    
    const response = await axios.get(`${BACKEND_URL}/wake-up`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't send credentials for wake-up calls to avoid auth issues
    });

    if (response.status === 200) {
      const data = response.data;
      console.log('✅ Backend wake-up successful:', data.message);
      console.log(`🕐 Server uptime: ${Math.floor(data.uptime / 60)} minutes`);
      return true;
    } else {
      console.warn('⚠️ Backend wake-up returned non-OK status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to wake up backend:', error);
    return false;
  }
};

// Start the wake-up service
export const startWakeUpService = (): void => {
  if (isWakeUpActive) {
    console.log('⏰ Wake-up service is already running');
    return;
  }

  console.log('🚀 Starting backend wake-up service...');
  console.log(`📅 Will ping backend every ${WAKE_UP_INTERVAL / 1000 / 60} minutes`);

  // Initial wake-up call
  wakeUpBackend();

  // Set up periodic wake-up calls
  wakeUpInterval = setInterval(() => {
    wakeUpBackend();
  }, WAKE_UP_INTERVAL);

  isWakeUpActive = true;
  console.log('✅ Wake-up service started successfully');
};

// Stop the wake-up service
export const stopWakeUpService = (): void => {
  if (wakeUpInterval) {
    clearInterval(wakeUpInterval);
    wakeUpInterval = null;
  }
  
  isWakeUpActive = false;
  console.log('🛑 Wake-up service stopped');
};

// Check if wake-up service is running
export const isWakeUpServiceActive = (): boolean => {
  return isWakeUpActive;
};

// Manual wake-up call (for debugging)
export const manualWakeUp = async (): Promise<boolean> => {
  console.log('🔧 Manual wake-up triggered');
  return await wakeUpBackend();
};

// Auto-start the service when this module is imported
// Only start in production or when backend is remote
if (BACKEND_URL.includes('onrender.com') || BACKEND_URL.includes('herokuapp.com')) {
  // Start after a short delay to allow app initialization
  setTimeout(() => {
    startWakeUpService();
  }, 5000); // 5 seconds delay
} 