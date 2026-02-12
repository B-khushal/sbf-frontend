/**
 * Utility to play a notification sound
 * This function plays a sound notification when new alerts arrive for the admin
 */

// Define audio for notification sound
let notificationAudio: HTMLAudioElement | null = null;

// Initialize the audio element
const initAudio = () => {
  if (notificationAudio) return;
  
  try {
    // Create an audio element with the notification sound
    notificationAudio = new Audio('/sounds/notification.mp3');
    notificationAudio.volume = 0.5; // Set volume to 50%
    
    // Preload the audio
    notificationAudio.load();
    
    console.log('Notification sound initialized');
  } catch (error) {
    console.error('Failed to initialize notification sound:', error);
  }
};

// Play the notification sound
export const playNotificationSound = (type: string = 'default') => {
  // Initialize audio if not already done
  if (!notificationAudio) {
    initAudio();
  }
  
  // Play the sound
  try {
    if (notificationAudio) {
      // Clone the audio element to allow rapid sequential plays
      const audioClone = notificationAudio.cloneNode() as HTMLAudioElement;
      
      // Adjust volume based on notification type
      if (type === 'order') {
        audioClone.volume = 0.7; // Louder for order notifications
      } else {
        audioClone.volume = 0.5; // Normal volume for other notifications
      }
      
      // Play the sound
      const playPromise = audioClone.play();
      
      // Handle play promise (required for some browsers)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing notification sound:', error);
          
          // Try with user interaction if autoplay was blocked
          if (error.name === 'NotAllowedError') {
            console.warn('Autoplay blocked. Sound will only play after user interaction.');
            
            // Show a visual indicator that sound is blocked
            const soundBlockedEvent = new CustomEvent('soundBlocked', {
              detail: { message: 'Click anywhere to enable notification sounds' }
            });
            window.dispatchEvent(soundBlockedEvent);
          }
        });
      }
      
      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} notification sound played`);
    }
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

// Test notification sound (for settings)
export const testNotificationSound = () => {
  playNotificationSound('test');
};

// Initialize on script load
initAudio(); 