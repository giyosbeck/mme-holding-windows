import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import useNetworkStatus from '../hooks/useNetworkStatus';

/**
 * Modal that appears when internet connection is lost
 * Critical for POS systems with unreliable connections
 */
const OfflineModal = () => {
  const t = useTranslation();
  const { isOnline, wasOffline } = useNetworkStatus();

  // Show "back online" success message briefly
  if (isOnline && wasOffline) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="text-8xl mb-6">✅</div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            {t.connectionRestored || 'Connection Restored'}
          </h2>
          <p className="text-xl text-gray-600">
            {t.internetBackOnline || 'Internet connection is back online'}
          </p>
        </div>
      </div>
    );
  }

  // Show offline warning when no connection
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="text-8xl mb-6">📡</div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            {t.noInternet || 'No Internet Connection'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t.checkConnection || 'Please check your internet connection and try again'}
          </p>

          {/* Animated connection indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-lg text-gray-500">
              {t.waitingForConnection || 'Waiting for connection...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineModal;
