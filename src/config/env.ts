/**
 * Типобезопасный доступ к окружению через expo-constants (app.json → extra).
 * Бэкенда пока нет — значения пустые/дефолтные; заполним при интеграции API.
 */
import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const env = {
  /** База URL API (пусто, пока бэкенд не готов). */
  apiBaseUrl: extra.apiBaseUrl ?? '',
};
