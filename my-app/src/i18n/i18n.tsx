// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ukTranslation from "../locales/uk/errors.json";
import enTranslation from "../locales/en/errors.json";

i18n.use(initReactI18next).init({
  resources: {
    uk: {
      translation: ukTranslation,
    },
    en: {
      translation: enTranslation,
    },
  },
  lng: "uk", // язык по умолчанию
  fallbackLng: "en", // если нет перевода - используем английский
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
