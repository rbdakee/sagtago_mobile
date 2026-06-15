import { describe, expect, it } from '@jest/globals';

import {
  calcOrderSummary,
  calcServiceFee,
  canShowDiscount,
  discountPct,
  isWithinWindow,
} from './rules';

describe('сервисный сбор', () => {
  it('3% с округлением', () => {
    expect(calcServiceFee(1000)).toBe(30);
    expect(calcServiceFee(2060)).toBe(62);
  });

  it('сводка заказа раскрывает базу, сбор и итог', () => {
    expect(calcOrderSummary(1030, 2)).toEqual({ base: 2060, serviceFee: 62, total: 2122 });
  });
});

describe('скидка', () => {
  it('процент от ценности', () => {
    expect(discountPct(1000, 3000)).toBe(67);
    expect(discountPct(0, 0)).toBe(0);
  });

  it('показываем только при цене ≤ ⅓ ценности', () => {
    expect(canShowDiscount(1000, 3000)).toBe(true);
    expect(canShowDiscount(1001, 3000)).toBe(false);
    expect(canShowDiscount(1000, 0)).toBe(false);
  });
});

describe('окно выдачи', () => {
  it('внутри окна', () => {
    expect(isWithinWindow({ from: '20:00', to: '21:30' }, new Date(2026, 0, 1, 20, 30))).toBe(true);
  });

  it('вне окна', () => {
    expect(isWithinWindow({ from: '20:00', to: '21:30' }, new Date(2026, 0, 1, 22, 0))).toBe(false);
  });

  it('окно через полночь', () => {
    expect(isWithinWindow({ from: '23:00', to: '01:00' }, new Date(2026, 0, 1, 0, 30))).toBe(true);
    expect(isWithinWindow({ from: '23:00', to: '01:00' }, new Date(2026, 0, 1, 2, 0))).toBe(false);
  });
});
