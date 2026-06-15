/** Публичный API слоя данных: `@/data`. */
export { getRepositories } from './repositories';
export type {
  BoxFilters,
  CreateOrderInput,
  CreateComplaintInput,
  Repositories,
} from './repositories/types';
export { queryClient } from './queries/queryClient';
export { qk } from './queries/keys';
export * from './queries/hooks';
