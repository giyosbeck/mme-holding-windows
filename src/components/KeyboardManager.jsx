import React from 'react';
import { useKeyboard } from '../context/KeyboardContext';
import TouchKeyboard from './TouchKeyboard';
import NumericKeypad from './NumericKeypad';
import useLanguageStore from '../store/languageStore';

const KeyboardManager = () => {
  const { isVisible, type, value, hideKeyboard, updateValue } = useKeyboard();
  const { language } = useLanguageStore();

  if (!isVisible) return null;

  // For text inputs, use TouchKeyboard
  if (type === 'text') {
    return (
      <TouchKeyboard
        value={value}
        onChange={updateValue}
        onClose={hideKeyboard}
        language={language}
      />
    );
  }

  // For number and decimal inputs, use NumericKeypad
  if (type === 'number' || type === 'decimal') {
    const mode = type === 'decimal' ? 'decimal' : 'integer';

    const handleNumberClick = (num) => {
      const newValue = value + num.toString();
      updateValue(newValue);
    };

    const handleBackspace = () => {
      const newValue = value.slice(0, -1);
      updateValue(newValue);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-transparent"
          onClick={hideKeyboard}
        />

        {/* NumericKeypad Container */}
        <div className="relative w-full bg-gray-900 rounded-t-3xl shadow-2xl p-6 animate-slide-up">
          <div className="flex justify-end mb-4">
            <button
              onClick={hideKeyboard}
              className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg font-medium
                active:scale-95 transition-all"
            >
              Done
            </button>
          </div>

          <NumericKeypad
            onNumberClick={handleNumberClick}
            onBackspace={handleBackspace}
            mode={mode}
          />
        </div>

        {/* Slide-up animation */}
        <style>{`
          .animate-slide-up {
            animation: slideUp 0.3s ease-out;
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default KeyboardManager;
