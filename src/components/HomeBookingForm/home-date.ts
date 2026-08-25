import type {Locale} from '@/types/locale';
import type {IsoDate} from '@/types/reservation';
import {
  formatCalendarDate,
  formatMonth,
  formatWeekday,
  type CalendarMonth
} from '@/lib/reservation/calendar';

export function formatHomeDate(value: IsoDate, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00Z`));
}

function getIntlLocale(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US';
}

function capitalizeLocalized(value: string, locale: Locale): string {
  if (locale !== 'ru' || value.length === 0) {
    return value;
  }

  return value[0].toLocaleUpperCase('ru-RU') + value.slice(1);
}

export function formatHomeMonth(month: CalendarMonth, locale: Locale): string {
  return capitalizeLocalized(formatMonth(month, getIntlLocale(locale)), locale);
}

export function formatHomeWeekday(index: number, locale: Locale): string {
  return capitalizeLocalized(formatWeekday(index, getIntlLocale(locale)), locale);
}

export function formatHomeAccessibleDate(value: IsoDate, locale: Locale): string {
  return formatCalendarDate(value, getIntlLocale(locale));
}
