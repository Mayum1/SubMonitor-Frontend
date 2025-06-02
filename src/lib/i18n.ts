import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../locales/en.json';
import ruTranslation from '../locales/ru.json';

// Get user's preferred language from localStorage or browser
const getUserLanguage = (): 'en' | 'ru' => {
  const savedLanguage = localStorage.getItem('userLanguage');
  if (savedLanguage === 'en' || savedLanguage === 'ru') {
    return savedLanguage;
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ru') {
    return 'ru';
  }
  
  // Default to English
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
    },
    lng: getUserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

// Function to change language
export const changeLanguage = (language: 'en' | 'ru') => {
  i18n.changeLanguage(language);
  localStorage.setItem('userLanguage', language);
};

export default i18n;