import useLanguageStore from '../store/languageStore';
import translations from '../translations';

export const useTranslation = () => {
  const { language } = useLanguageStore();
  return translations[language] || translations.uz;
};
