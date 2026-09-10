import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en/translation.json';
import es from './es/translation.json';
import fr from './fr/translation.json';
import pt from './pt/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      pt: { translation: pt },
    },
    lng: 'es',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
