import React from 'react';
import { useKeyboard } from '../context/KeyboardContext';

const KeyboardToggleButton = () => {
  const { physicalKeyboardDetected, enableVirtualKeyboard } = useKeyboard();

  // Only show button if physical keyboard was detected
  if (!physicalKeyboardDetected) {
    return null;
  }

  return (
    <button
      onClick={enableVirtualKeyboard}
      className="fixed bottom-4 right-4 z-50
        w-14 h-14 bg-blue-500 text-white text-2xl
        rounded-full shadow-lg
        flex items-center justify-center
        active:scale-95 transition-all
        hover:bg-blue-600"
      title="Enable Virtual Keyboard"
      aria-label="Enable Virtual Keyboard"
    >
      ⌨️
    </button>
  );
};

export default KeyboardToggleButton;
