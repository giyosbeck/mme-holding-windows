import React, { useState, useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { useTranslation } from '../hooks/useTranslation';

const TouchKeyboard = ({ value, onChange, onClose, language: initialLanguage }) => {
  const t = useTranslation();
  const [language, setLanguage] = useState(initialLanguage || 'en');
  const [layoutName, setLayoutName] = useState('default');
  const keyboardRef = useRef();

  // Keyboard layouts for different languages
  const layouts = {
    en: {
      default: [
        'q w e r t y u i o p',
        'a s d f g h j k l',
        '{shift} z x c v b n m {backspace}',
        '{numbers} {space} {close}'
      ],
      shift: [
        'Q W E R T Y U I O P',
        'A S D F G H J K L',
        '{shift} Z X C V B N M {backspace}',
        '{numbers} {space} {close}'
      ],
      numbers: [
        '1 2 3 4 5 6 7 8 9 0',
        '@ # $ % & - + = ( )',
        '{abc} . , ! ? / : ; {backspace}',
        '{space} {close}'
      ]
    },
    uz: {
      default: [
        'q w e r t y u i o p oʻ gʻ',
        'a s d f g h j k l',
        '{shift} z x c v b n m {backspace}',
        '{numbers} {space} {close}'
      ],
      shift: [
        'Q W E R T Y U I O P Oʻ Gʻ',
        'A S D F G H J K L',
        '{shift} Z X C V B N M {backspace}',
        '{numbers} {space} {close}'
      ],
      numbers: [
        '1 2 3 4 5 6 7 8 9 0',
        '@ # $ % & - + = ( )',
        '{abc} . , ! ? / : ; {backspace}',
        '{space} {close}'
      ]
    },
    ru: {
      default: [
        'й ц у к е н г ш щ з х ъ',
        'ф ы в а п р о л д ж э',
        '{shift} я ч с м и т ь б ю {backspace}',
        '{numbers} {space} {close}'
      ],
      shift: [
        'Й Ц У К Е Н Г Ш Щ З Х Ъ',
        'Ф Ы В А П Р О Л Д Ж Э',
        '{shift} Я Ч С М И Т Ь Б Ю {backspace}',
        '{numbers} {space} {close}'
      ],
      numbers: [
        '1 2 3 4 5 6 7 8 9 0',
        '@ # $ % & - + = ( )',
        '{abc} . , ! ? / : ; {backspace}',
        '{space} {close}'
      ]
    }
  };

  const display = {
    '{numbers}': '123',
    '{abc}': 'ABC',
    '{shift}': '⇧',
    '{backspace}': '⌫',
    '{space}': t.keyboard?.space || 'Space',
    '{close}': t.keyboard?.done || 'Done',
  };

  const handleKeyPress = (button) => {
    if (button === '{shift}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
    } else if (button === '{numbers}') {
      setLayoutName('numbers');
    } else if (button === '{abc}') {
      setLayoutName('default');
    } else if (button === '{close}') {
      onClose();
    }
  };

  const handleChange = (input) => {
    onChange(input);
  };

  // Sync keyboard value with prop
  useEffect(() => {
    if (keyboardRef.current) {
      keyboardRef.current.setInput(value);
    }
  }, [value]);

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />

      {/* Keyboard Container */}
      <div className="relative w-full bg-gray-900 rounded-t-3xl shadow-2xl p-6 animate-slide-up">
        {/* Language and Layout Controls */}
        <div className="flex justify-between items-center mb-4">
          {/* Language Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLanguage('en');
                setLayoutName('default');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all
                ${language === 'en'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-700 text-gray-200 active:scale-95'
                }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                setLanguage('uz');
                setLayoutName('default');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all
                ${language === 'uz'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-700 text-gray-200 active:scale-95'
                }`}
            >
              UZ
            </button>
            <button
              onClick={() => {
                setLanguage('ru');
                setLayoutName('default');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all
                ${language === 'ru'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-700 text-gray-200 active:scale-95'
                }`}
            >
              RU
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg font-medium
              active:scale-95 transition-all"
          >
            {t.keyboard?.done || 'Done'}
          </button>
        </div>

        {/* Keyboard */}
        <Keyboard
          keyboardRef={(r) => (keyboardRef.current = r)}
          layoutName={layoutName}
          layout={layouts[language]}
          display={display}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          theme="hg-theme-default custom-keyboard"
          buttonTheme={[
            {
              class: 'hg-highlight',
              buttons: '{shift} {backspace} {numbers} {abc} {space} {close}'
            }
          ]}
        />
      </div>

      {/* Custom Styles */}
      <style>{`
        .custom-keyboard .hg-button {
          height: 56px;
          font-size: 18px;
          font-weight: 500;
          border-radius: 8px;
          background: #374151;
          border: 2px solid #4b5563;
          color: #f3f4f6;
          transition: all 0.15s;
        }

        .custom-keyboard .hg-button:active {
          background: #3b82f6;
          color: white;
          transform: scale(0.95);
        }

        .custom-keyboard .hg-highlight {
          background: #4b5563;
          color: #e5e7eb;
        }

        .custom-keyboard .hg-highlight:active {
          background: #3b82f6;
          color: white;
        }

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
};

export default TouchKeyboard;
