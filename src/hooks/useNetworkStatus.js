import { useState, useEffect } from 'react';

/**
 * Custom hook to detect online/offline network status
 * Critical for POS systems with unreliable internet connections
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Internet connection restored');
      setIsOnline(true);
      // Track that we were offline (useful for showing "back online" message)
      if (wasOffline) {
        setTimeout(() => setWasOffline(false), 3000); // Clear after 3s
      }
    };

    const handleOffline = () => {
      console.log('❌ Internet connection lost');
      setIsOnline(false);
      setWasOffline(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

export default useNetworkStatus;
