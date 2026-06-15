/**
 * Реестр i18n-ресурсов. ФУНДАМЕНТ-ФАЙЛ — агенты его НЕ редактируют.
 * Каждый неймспейс = отдельный JSON-файл (по фиче), чтобы параллельные агенты
 * правили непересекающиеся файлы. Агент наполняет только свой ns в locales/ru
 * (и locales/kk на этапе локализации). Этот индекс уже импортирует все ns.
 */
import commonRu from './locales/ru/common.json';
import statesRu from './locales/ru/states.json';
import authRu from './locales/ru/auth.json';
import homeRu from './locales/ru/home.json';
import boxRu from './locales/ru/box.json';
import bookingRu from './locales/ru/booking.json';
import ordersRu from './locales/ru/orders.json';
import ratingRu from './locales/ru/rating.json';
import complaintRu from './locales/ru/complaint.json';
import favoritesRu from './locales/ru/favorites.json';
import profileRu from './locales/ru/profile.json';

import commonKk from './locales/kk/common.json';
import statesKk from './locales/kk/states.json';
import authKk from './locales/kk/auth.json';
import homeKk from './locales/kk/home.json';
import boxKk from './locales/kk/box.json';
import bookingKk from './locales/kk/booking.json';
import ordersKk from './locales/kk/orders.json';
import ratingKk from './locales/kk/rating.json';
import complaintKk from './locales/kk/complaint.json';
import favoritesKk from './locales/kk/favorites.json';
import profileKk from './locales/kk/profile.json';

export const namespaces = [
  'common',
  'states',
  'auth',
  'home',
  'box',
  'booking',
  'orders',
  'rating',
  'complaint',
  'favorites',
  'profile',
] as const;

export type Namespace = (typeof namespaces)[number];

export const defaultNS = 'common' satisfies Namespace;

export const resources = {
  ru: {
    common: commonRu,
    states: statesRu,
    auth: authRu,
    home: homeRu,
    box: boxRu,
    booking: bookingRu,
    orders: ordersRu,
    rating: ratingRu,
    complaint: complaintRu,
    favorites: favoritesRu,
    profile: profileRu,
  },
  kk: {
    common: commonKk,
    states: statesKk,
    auth: authKk,
    home: homeKk,
    box: boxKk,
    booking: bookingKk,
    orders: ordersKk,
    rating: ratingKk,
    complaint: complaintKk,
    favorites: favoritesKk,
    profile: profileKk,
  },
} as const;
