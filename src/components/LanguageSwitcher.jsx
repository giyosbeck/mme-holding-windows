import React from 'react';
import useLanguageStore from '../store/languageStore';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore();

  const languages = [
    { code: 'uz', label: 'O\'zbek' },
    { code: 'ru', label: 'Русский' }
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`
            px-6 py-3 text-lg font-medium rounded-lg transition-colors
            ${language === lang.code
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
