import {describe, expect, it} from 'vitest';

import {
  addCalendarDays,
  compareCalendarDates,
  createIsoDate,
  formatCalendarDate,
  formatPrice,
  formatWeekday,
  formatMonth,
  getDaysInMonth,
  getMoscowTodayIso,
  getNights,
  getMonthFirstWeekday,
  getMonthKey,
  getMonthStart,
  isDateInMonth,
  getCalendarMonth,
  parseIsoDate,
  shiftMonth
} from '@/lib/reservation/calendar';
import {getPluralForm} from '@/lib/reservation/plural';
import type {IsoDate, ReservationPluralForms} from '@/types/reservation';

const iso = (value: string): IsoDate => value as IsoDate;

describe('calendar arithmetic', () => {
  it('parses strict valid ISO dates and rejects invalid calendar dates', () => {
    expect(parseIsoDate('2024-02-29')).toEqual({day: 29, month: 2, year: 2024});
    expect(() => parseIsoDate('2023-02-29')).toThrow();
    expect(() => parseIsoDate('2024-2-09')).toThrow();
  });

  it('handles month and year transitions without local-time arithmetic', () => {
    expect(createIsoDate(2025, 1, 9)).toBe('2025-01-09');
    expect(addCalendarDays(iso('2024-02-28'), 1)).toBe('2024-02-29');
    expect(addCalendarDays(iso('2024-12-31'), 1)).toBe('2025-01-01');
    expect(shiftMonth({month: 12, year: 2024}, 1)).toEqual({month: 1, year: 2025});
    expect(shiftMonth({month: 1, year: 2025}, -1)).toEqual({month: 12, year: 2024});
    expect(getDaysInMonth({month: 2, year: 2024})).toBe(29);
  });

  it('compares dates and calculates only positive calendar nights', () => {
    expect(compareCalendarDates(iso('2025-01-01'), iso('2025-01-02'))).toBe(-1);
    expect(compareCalendarDates(iso('2025-01-02'), iso('2025-01-02'))).toBe(0);
    expect(compareCalendarDates(iso('2025-01-03'), iso('2025-01-02'))).toBe(1);
    expect(getNights(iso('2024-12-31'), iso('2025-01-01'))).toBe(1);
    expect(getNights(iso('2024-02-28'), iso('2024-03-01'))).toBe(2);
    expect(getNights(iso('2025-03-29'), iso('2025-04-01'))).toBe(3);
    expect(getNights(iso('2025-04-01'), iso('2025-04-01'))).toBeNull();
    expect(getNights(iso('2025-04-02'), iso('2025-04-01'))).toBeNull();
    expect(getNights(null, iso('2025-04-01'))).toBeNull();
  });

  it('formats calendar labels from UTC and exposes stable month metadata', () => {
    expect(getCalendarMonth(iso('2026-08-16'))).toEqual({month: 8, year: 2026});
    expect(getMonthKey({month: 1, year: 2025})).toBe('2025-01');
    expect(getMonthStart({month: 1, year: 2025})).toBe('2025-01-01');
    expect(isDateInMonth(iso('2025-01-09'), {month: 1, year: 2025})).toBe(true);
    expect(isDateInMonth(iso('2025-02-09'), {month: 1, year: 2025})).toBe(false);
    expect(getMonthFirstWeekday({month: 1, year: 2024})).toBe(0);
    expect(getMonthFirstWeekday({month: 9, year: 2024})).toBe(6);
    expect(formatCalendarDate(iso('2025-01-09'), 'en-US')).toContain('January');
    expect(formatMonth({month: 1, year: 2025}, 'en-US')).toContain('January');
    expect(formatWeekday(0, 'en-US')).toContain('Mon');
    expect(formatPrice(1500, 'en-US')).toContain('1,500');
  });

  it('derives the Moscow calendar date at a fixed UTC boundary', () => {
    expect(getMoscowTodayIso(new Date('2026-08-16T20:59:59.999Z'))).toBe('2026-08-16');
    expect(getMoscowTodayIso(new Date('2026-08-16T21:00:00.000Z'))).toBe('2026-08-17');
  });
});

describe('reservation plural forms', () => {
  const forms: ReservationPluralForms = {few: 'few', many: 'many', one: 'one', other: 'other'};

  it('uses locale-aware Russian and English categories', () => {
    expect(getPluralForm('ru', 1, forms)).toBe('one');
    expect(getPluralForm('ru', 2, forms)).toBe('few');
    expect(getPluralForm('ru', 5, forms)).toBe('many');
    expect(getPluralForm('en', 1, forms)).toBe('one');
    expect(getPluralForm('en', 2, forms)).toBe('other');
    expect(getPluralForm('ar', 0, forms)).toBe('other');
  });
});
