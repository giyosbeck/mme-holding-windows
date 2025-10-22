import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Auto-update notification component
 * Shows when updates are available and handles download/install
 */
const UpdateNotification = () => {
  const t = useTranslation();
  const [updateState, setUpdateState] = useState(null); // null, 'checking', 'available', 'downloading', 'downloaded', 'error'
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if running in Electron
    if (typeof window.electron === 'undefined') {
      return;
    }

    // Set up update event listeners
    window.electron.updates.onUpdateChecking(() => {
      console.log('🔍 Checking for updates...');
      setUpdateState('checking');
    });

    window.electron.updates.onUpdateAvailable((info) => {
      console.log('✅ Update available:', info.version);
      setUpdateState('available');
      setUpdateInfo(info);
    });

    window.electron.updates.onUpdateNotAvailable((info) => {
      console.log('✅ App is up to date');
      setUpdateState(null);
    });

    window.electron.updates.onDownloadProgress((progress) => {
      console.log(`📥 Downloading: ${progress.percent.toFixed(2)}%`);
      setUpdateState('downloading');
      setDownloadProgress(progress.percent);
    });

    window.electron.updates.onUpdateDownloaded((info) => {
      console.log('✅ Update downloaded, ready to install');
      setUpdateState('downloaded');
      setUpdateInfo(info);
    });

    window.electron.updates.onUpdateError((errorMsg) => {
      console.error('❌ Update error:', errorMsg);
      setUpdateState('error');
      setError(errorMsg);
    });

    // Cleanup listeners on unmount
    return () => {
      if (window.electron) {
        window.electron.updates.removeUpdateListeners();
      }
    };
  }, []);

  const handleDownload = () => {
    if (window.electron) {
      window.electron.updates.downloadUpdate();
    }
  };

  const handleInstall = () => {
    if (window.electron) {
      window.electron.updates.installUpdate();
    }
  };

  const handleDismiss = () => {
    setUpdateState(null);
  };

  // Don't render if no update state or if checking
  if (!updateState || updateState === 'checking') {
    return null;
  }

  // Error state
  if (updateState === 'error') {
    return (
      <div className="fixed bottom-8 right-8 z-[100] bg-red-600 text-white rounded-2xl p-6 shadow-2xl max-w-sm">
        <div className="flex items-start gap-4">
          <div className="text-3xl">❌</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{t.updateError || 'Update Error'}</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <button onClick={handleDismiss} className="text-2xl hover:opacity-70 active:scale-95 transition-all">✕</button>
        </div>
      </div>
    );
  }

  // Update available - Download prompt
  if (updateState === 'available') {
    return (
      <div className="fixed bottom-8 right-8 z-[100] bg-blue-600 text-white rounded-2xl p-6 shadow-2xl max-w-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-3xl">🔄</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{t.updateAvailable || 'Update Available'}</h3>
            <p className="text-sm opacity-90">
              {t.newVersion || 'Version'} {updateInfo?.version}
            </p>
          </div>
          <button onClick={handleDismiss} className="text-2xl hover:opacity-70 active:scale-95 transition-all">✕</button>
        </div>
        <button
          onClick={handleDownload}
          className="w-full h-12 bg-white text-blue-600 rounded-xl font-semibold
            active:scale-95 transition-all shadow-md"
        >
          {t.downloadUpdate || 'Download Update'}
        </button>
      </div>
    );
  }

  // Downloading
  if (updateState === 'downloading') {
    return (
      <div className="fixed bottom-8 right-8 z-[100] bg-blue-600 text-white rounded-2xl p-6 shadow-2xl max-w-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-3xl">📥</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{t.downloading || 'Downloading...'}</h3>
            <p className="text-sm opacity-90">{downloadProgress.toFixed(0)}%</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${downloadProgress}%` }}
          />
        </div>
      </div>
    );
  }

  // Downloaded - Install prompt
  if (updateState === 'downloaded') {
    return (
      <div className="fixed bottom-8 right-8 z-[100] bg-green-600 text-white rounded-2xl p-6 shadow-2xl max-w-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-3xl">✅</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{t.updateReady || 'Update Ready'}</h3>
            <p className="text-sm opacity-90">
              {t.restartToInstall || 'Restart to install the update'}
            </p>
          </div>
          <button onClick={handleDismiss} className="text-2xl hover:opacity-70 active:scale-95 transition-all">✕</button>
        </div>
        <button
          onClick={handleInstall}
          className="w-full h-12 bg-white text-green-600 rounded-xl font-semibold
            active:scale-95 transition-all shadow-md"
        >
          {t.installAndRestart || 'Install & Restart'}
        </button>
      </div>
    );
  }

  return null;
};

export default UpdateNotification;
