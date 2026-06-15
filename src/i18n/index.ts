/**
 * Инициализация i18next. RU — дефолт и фолбэк, KK — обязателен (наполняется по
 * мере готовности UI). Стартовый язык: из prefsStore (персист) или из устройства.
 * После гидрации prefsStore root-layout синхронизирует язык через syncLanguage().
 *
 * Правило проекта: НИКАКИХ хардкод-строк в UI — только t('ns:key').
 */
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { usePrefsStore, type Language } from '@/store/prefsStore';

import { defaultNS, namespaces, resources } from './resources';

function initialLanguage(): Language {
  const stored = usePrefsStore.getState().language;
  if (stored === 'ru' || stored === 'kk') return stored;
  const device = Localization.getLocales()[0]?.languageCode;
  return device === 'kk' ? 'kk' : 'ru';
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage(),
    fallbackLng: 'ru',
    defaultNS,
    ns: [...namespaces],
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });
}

/** Привести i18next к языку из prefsStore (вызывается после гидрации). */
export function syncLanguage(language: Language) {
  if (i18n.language !== language) void i18n.changeLanguage(language);
}

export default i18n;
