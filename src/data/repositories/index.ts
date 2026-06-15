/**
 * Фабрика репозиториев — ЕДИНСТВЕННАЯ точка подмены источника данных.
 * Сейчас отдаёт плейсхолдеры. Когда бэкенд отдаст контракт — здесь вернём
 * реализацию из data/api. Query-хуки и экраны при этом не меняются.
 */
import { placeholderRepositories } from '../placeholders/repos';

import type { Repositories } from './types';

export function getRepositories(): Repositories {
  return placeholderRepositories;
}

export * from './types';
