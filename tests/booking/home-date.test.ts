import {describe, expect, it} from 'vitest';

import {
  formatHomeAccessibleDate,
  formatHomeDate,
  formatHomeMonth,
  formatHomeWeekday
} from '@/components/HomeBookingForm/home-date';
import enMessages from '@/messages/en.json';
import ruMessages from '@/messages/ru.json';

describe('Home booking localization', () => {
  it('uses locale-specific Home placeholders', () => {
    expect(ruMessages.home.booking.guestNameLabel).toBe('Имя гостя');
    expect(enMessages.home.booking.guestNameLabel).toBe('Guest name');
    expect(ruMessages.home.booking.guestNamePlaceholder).toBe('Иванов Иван Иванович');
    expect(enMessages.home.booking.guestNamePlaceholder).toBe('John Smith');
    expect(ruMessages.home.booking.datePlaceholder).toBe('дд.мм.гггг');
    expect(enMessages.home.booking.datePlaceholder).toBe('mm/dd/yyyy');
    expect(ruMessages.home.booking.guestEmailPlaceholder).toBe('name@example.com');
    expect(enMessages.home.booking.guestEmailPlaceholder).toBe('name@example.com');
    expect(ruMessages.home.booking.captchaPlaceholder).toBe('Введите капчу');
    expect(enMessages.home.booking.captchaPlaceholder).toBe('Enter the CAPTCHA');
  });

  it('formats the same ISO date without a timezone shift', () => {
    const isoDate = '2026-08-27' as const;

    expect(formatHomeDate(isoDate, 'ru')).toBe('27.08.2026');
    expect(formatHomeDate(isoDate, 'en')).toBe('08/27/2026');
    expect(formatHomeAccessibleDate(isoDate, 'ru')).toContain('27 августа 2026');
    expect(formatHomeAccessibleDate(isoDate, 'en')).toContain('August 27, 2026');
    expect(isoDate).toBe('2026-08-27');
  });

  it('localizes the custom calendar month and weekdays', () => {
    const august = {month: 8, year: 2026};

    expect(formatHomeMonth(august, 'ru')).toBe('Август 2026 г.');
    expect(formatHomeMonth(august, 'en')).toBe('August 2026');
    expect(Array.from({length: 7}, (_, index) => formatHomeWeekday(index, 'ru'))).toEqual([
      'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'
    ]);
    expect(Array.from({length: 7}, (_, index) => formatHomeWeekday(index, 'en'))).toEqual([
      'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    ]);
  });

  it('provides localized calendar actions without Cyrillic in English', () => {
    expect(ruMessages.home.booking.today).toBe('Сегодня');
    expect(ruMessages.home.booking.clearDate).toBe('Очистить');
    expect(enMessages.home.booking.today).toBe('Today');
    expect(enMessages.home.booking.clearDate).toBe('Clear');
    expect(JSON.stringify({
      calendarLabel: enMessages.home.booking.calendarLabel,
      clearDate: enMessages.home.booking.clearDate,
      nextMonth: enMessages.home.booking.nextMonth,
      previousMonth: enMessages.home.booking.previousMonth,
      today: enMessages.home.booking.today
    })).not.toMatch(/[А-Яа-яЁё]/u);
  });

  it('does not expose Cyrillic in English Home booking messages', () => {
    expect(JSON.stringify(enMessages.home.booking)).not.toMatch(/[А-Яа-яЁё]/u);
  });
});
