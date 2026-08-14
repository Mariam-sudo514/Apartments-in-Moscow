import type {IsoDate} from '@/types/reservation';

export type CalendarMonth = {
  readonly year: number;
  readonly month: number;
};

type DateParts = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

const MS_PER_DAY = 86_400_000;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function parseIsoDate(value: IsoDate | string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(`Invalid calendar date: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${value}`);
  }

  return {day, month, year};
}

export function createIsoDate(year: number, month: number, day: number): IsoDate {
  return `${year}-${pad(month)}-${pad(day)}` as IsoDate;
}

export function getCalendarMonth(value: IsoDate): CalendarMonth {
  const {month, year} = parseIsoDate(value);
  return {month, year};
}

export function getMonthKey(month: CalendarMonth): string {
  return `${month.year}-${pad(month.month)}`;
}

export function getMonthStart(month: CalendarMonth): IsoDate {
  return createIsoDate(month.year, month.month, 1);
}

export function getDaysInMonth(month: CalendarMonth): number {
  return new Date(Date.UTC(month.year, month.month, 0)).getUTCDate();
}

export function shiftMonth(month: CalendarMonth, offset: number): CalendarMonth {
  const shifted = new Date(Date.UTC(month.year, month.month - 1 + offset, 1));
  return {
    month: shifted.getUTCMonth() + 1,
    year: shifted.getUTCFullYear()
  };
}

export function addCalendarDays(value: IsoDate, offset: number): IsoDate {
  const {day, month, year} = parseIsoDate(value);
  const shifted = new Date(Date.UTC(year, month - 1, day + offset));
  return createIsoDate(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate()
  );
}

export function compareCalendarDates(left: IsoDate, right: IsoDate): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function isDateInMonth(value: IsoDate, month: CalendarMonth): boolean {
  const parts = parseIsoDate(value);
  return parts.year === month.year && parts.month === month.month;
}

export function getMonthFirstWeekday(month: CalendarMonth): number {
  const weekday = new Date(Date.UTC(month.year, month.month - 1, 1)).getUTCDay();
  return weekday === 0 ? 6 : weekday - 1;
}

export function getNights(checkIn: IsoDate | null, checkOut: IsoDate | null): number | null {
  if (checkIn === null || checkOut === null || compareCalendarDates(checkOut, checkIn) <= 0) {
    return null;
  }

  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);

  return Math.round((endUtc - startUtc) / MS_PER_DAY);
}

export function formatCalendarDate(value: IsoDate, locale: string): string {
  const {day, month, year} = parseIsoDate(value);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatMonth(month: CalendarMonth, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)));
}

export function formatWeekday(index: number, locale: string): string {
  const monday = new Date(Date.UTC(2024, 0, 1 + index));
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC'
  }).format(monday);
}

export function formatPrice(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    currency: 'RUB',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(value);
}

export function getMoscowTodayIso(now: Date = new Date()): IsoDate {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Moscow',
    year: 'numeric'
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts
      .filter(({type}) => type !== 'literal')
      .map(({type, value}) => [type, value])
  );

  return createIsoDate(Number(values.year), Number(values.month), Number(values.day));
}
