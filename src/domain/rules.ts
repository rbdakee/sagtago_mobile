/**
 * Бизнес-правила и расчёты (BP.md §0). Чистые функции, покрыты тестами
 * (rules.test.ts). Источник правды для денег/скидок/окна — здесь, не в UI.
 */
import type { PickupWindow } from './types';

/** Сервисный сбор — 3% (R1; default из BP.md, per-merchant настраивается на бэке). */
export const SERVICE_FEE_PCT = 0.03;

/** Сервисный сбор от базовой суммы, ₸ (округление до целого). */
export function calcServiceFee(base: number): number {
  return Math.round(base * SERVICE_FEE_PCT);
}

export type OrderSummary = {
  /** price * qty. */
  base: number;
  serviceFee: number;
  total: number;
};

/** Сводка суммы для C-09 (раскрываем сбор отдельной строкой — R1). */
export function calcOrderSummary(price: number, qty: number): OrderSummary {
  const base = price * qty;
  const serviceFee = calcServiceFee(base);
  return { base, serviceFee, total: base + serviceFee };
}

/** Процент скидки от ценности (0..100). */
export function discountPct(price: number, value: number): number {
  if (value <= 0) return 0;
  return Math.round((1 - price / value) * 100);
}

/** Правило показа скидки: цена ≤ ⅓ ценности (BP-03 / docs/06-merchant-rules). */
export function canShowDiscount(price: number, value: number): boolean {
  return value > 0 && price <= value / 3;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Активно ли окно выдачи в момент `now`. Сравнение по минутам дня; поддержан
 * переход окна через полночь (например 23:00–01:00).
 */
export function isWithinWindow(window: PickupWindow, now: Date): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  const from = toMinutes(window.from);
  const to = toMinutes(window.to);
  return from <= to ? cur >= from && cur <= to : cur >= from || cur <= to;
}
