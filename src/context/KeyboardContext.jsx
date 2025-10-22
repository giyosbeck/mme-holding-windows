import React, { createContext, useState, useContext, useCallback } from 'react';

const KeyboardContext = createContext(null);

export const KeyboardProvider = ({ children }) => {
  const [keyboardState, setKeyboardState] = useState({
    isVisible: false,
    type: 'text', // 'text', 'number', 'decimal'
    value: '',
    onChange: null,
    onClose: null,
  });

  const showKeyboard = useCallback((type, initialValue, onChange, onClose) => {
    setKeyboardState({
      isVisible: true,
      type,
      value: initialValue || '',
      onChange,
      onClose,
    });
  }, []);

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

  const value = {
    ...keyboardState,
    showKeyboard,
    hideKeyboard,
    updateValue,
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
