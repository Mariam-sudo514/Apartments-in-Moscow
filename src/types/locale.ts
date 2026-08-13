import 'next-intl';

import type ruMessages from '@/messages/ru.json';

export const locales = ['ru', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ru';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof ruMessages;
  }
}
