// Session management utility for notification tracking

const SESSION_KEY = 'admin_session_id';
const LOGIN_TIME_KEY = 'admin_login_time';

// Generate a unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get current session ID or create a new one
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Create a new session (called on login)
export const createNewSession = (): string => {
  const sessionId = generateSessionId();
  const loginTime = new Date().toISOString();
  
  localStorage.setItem(SESSION_KEY, sessionId);
  localStorage.setItem(LOGIN_TIME_KEY, loginTime);
  
  console.log('New session created:', sessionId);
  return sessionId;
};

// Get the login time for current session
export const getLoginTime = (): string | null => {
  return localStorage.getItem(LOGIN_TIME_KEY);
};

// Check if this is a new session since last login
export const isNewSession = (): boolean => {
  const loginTime = getLoginTime();
  const sessionId = localStorage.getItem(SESSION_KEY);
  
  // If no login time or session ID, it's a new session
  if (!loginTime || !sessionId) {
    return true;
  }
  
  // Check if session is older than 8 hours (consider it new)
  const loginDate = new Date(loginTime);
  const now = new Date();
  const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceLogin > 8;
};

// Clear session data
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LOGIN_TIME_KEY);
}; 