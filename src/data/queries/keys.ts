/** Ключи кэша TanStack Query — единый словарь (инвалидация по префиксам). */
import type { BoxFilters } from '../repositories/types';

export const qk = {
  boxes: (filters?: BoxFilters) => ['boxes', filters ?? {}] as const,
  box: (id: string) => ['box', id] as const,
  favorites: () => ['favorites'] as const,
  favoriteIds: () => ['favorites', 'ids'] as const,
  ordersActive: () => ['orders', 'active'] as const,
  ordersHistory: () => ['orders', 'history'] as const,
  order: (id: string) => ['order', id] as const,
};
