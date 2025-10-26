import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const KeyboardContext = createContext(null);

export const KeyboardProvider = ({ children }) => {
  const [keyboardState, setKeyboardState] = useState({
    isVisible: false,
    type: 'text', // 'text', 'number', 'decimal'
    value: '',
    onChange: null,
    onClose: null,
  });

  // Track physical keyboard detection (localStorage)
  const [physicalKeyboardDetected, setPhysicalKeyboardDetected] = useState(() => {
    return localStorage.getItem('physical_keyboard_detected') === 'true';
  });

  // Listen for physical keyboard usage
  useEffect(() => {
    const handlePhysicalKeyboard = (e) => {
      // Detect actual typing (not just navigation keys)
      const isTypingKey =
        e.key.length === 1 || // Any printable character
        e.key === 'Backspace' ||
        e.key === 'Enter' ||
        e.key === 'Delete';

      if (isTypingKey && !physicalKeyboardDetected) {
        console.log('⌨️ Physical keyboard detected!');
        localStorage.setItem('physical_keyboard_detected', 'true');
        setPhysicalKeyboardDetected(true);

        // Hide virtual keyboard if it's currently visible
        if (keyboardState.isVisible) {
          hideKeyboard();
        }
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyboard);
    return () => window.removeEventListener('keydown', handlePhysicalKeyboard);
  }, [physicalKeyboardDetected, keyboardState.isVisible]);

  const showKeyboard = useCallback((type, initialValue, onChange, onClose) => {
    // Don't show virtual keyboard if physical keyboard was detected
    if (physicalKeyboardDetected) {
      console.log('⌨️ Virtual keyboard disabled (physical keyboard detected)');
      return;
    }

    setKeyboardState({
      isVisible: true,
      type,
      value: initialValue || '',
      onChange,
      onClose,
    });
  }, [physicalKeyboardDetected]);

  const hideKeyboard = useCallback(() => {
    if (keyboardState.onClose) {
      keyboardState.onClose();
    }
    setKeyboardState({
      isVisible: false,
      type: 'text',
      value: '',
      onChange: null,
      onClose: null,
    });
  }, [keyboardState]);

  const updateValue = useCallback((newValue) => {
    setKeyboardState(prev => ({
      ...prev,
      value: newValue,
    }));
    if (keyboardState.onChange) {
      keyboardState.onChange(newValue);
    }
  }, [keyboardState]);

  // Function to re-enable virtual keyboard (reset detection)
  const enableVirtualKeyboard = useCallback(() => {
    console.log('⌨️ Virtual keyboard re-enabled');
    localStorage.removeItem('physical_keyboard_detected');
    setPhysicalKeyboardDetected(false);
  }, []);

  const value = {
    ...keyboardState,
    showKeyboard,
    hideKeyboard,
    updateValue,
    physicalKeyboardDetected,
    enableVirtualKeyboard,
  };

  return (
    <KeyboardContext.Provider value={value}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within KeyboardProvider');
  }
  return context;
};

export default KeyboardContext;
