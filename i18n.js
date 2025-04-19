// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome!',
      balance: 'Total Balance'
    },
  },
  es: {
    translation: {
      welcome: '¡Bienvenido!',
      balance: 'Balance Total'
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es', // idioma por defecto
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
