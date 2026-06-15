/**
 * Форматтеры (DESIGN.md §4.3). Деньги — `1 030 ₸` (неразрывный пробел-разделитель),
 * окно выдачи — `20:00–21:30` (en dash). Используются везде; не дублировать в UI.
 */
import type { PickupWindow } from '@/domain';

/** Неразрывный пробел (U+00A0) — чтобы число и ₸ не переносились. */
const NBSP = String.fromCharCode(0xa0);

const MONTHS_RU = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

/** `1030` → `1 030 ₸`. */
export function formatMoney(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(Math.round(value));
  const grouped = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${sign}${grouped}${NBSP}₸`;
}

/** `{from:'20:00',to:'21:30'}` → `20:00–21:30`. */
export function formatWindow(window: PickupWindow): string {
  return `${window.from}–${window.to}`;
}

/** `320` → `320 м`, `1240` → `1,2 км`. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}${NBSP}м`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')}${NBSP}км`;
}

/**
 * Категория русского плюрала (CLDR) для целого `count`: `one | few | many`.
 * Hermes в RN не гарантирует `Intl.PluralRules`, поэтому выбираем форму сами —
 * ключи i18n храним как `key_one|key_few|key_many` и собираем суффикс этим хелпером:
 * `t(`key_${pluralRu(n)}`, { count: n })`.
 */
export function pluralRu(count: number): 'one' | 'few' | 'many' {
  const n = Math.abs(Math.trunc(count));
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
}

/** ISO → `15 июн`. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}${NBSP}${MONTHS_RU[d.getMonth()]}`;
}
