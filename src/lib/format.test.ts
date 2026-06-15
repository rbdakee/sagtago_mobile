import { describe, expect, it } from '@jest/globals';

import { formatDistance, formatMoney, formatWindow } from './format';

const NBSP = String.fromCharCode(0xa0);

describe('formatMoney', () => {
  it('группирует тысячи неразрывным пробелом и добавляет ₸', () => {
    expect(formatMoney(1030)).toBe(`1${NBSP}030${NBSP}₸`);
    expect(formatMoney(990)).toBe(`990${NBSP}₸`);
    expect(formatMoney(1234567)).toBe(`1${NBSP}234${NBSP}567${NBSP}₸`);
  });
});

describe('formatWindow', () => {
  it('окно через en dash', () => {
    expect(formatWindow({ from: '20:00', to: '21:30' })).toBe('20:00–21:30');
  });
});

describe('formatDistance', () => {
  it('метры до 1 км, иначе км с одним знаком', () => {
    expect(formatDistance(320)).toBe(`320${NBSP}м`);
    expect(formatDistance(1240)).toBe(`1,2${NBSP}км`);
  });
});
