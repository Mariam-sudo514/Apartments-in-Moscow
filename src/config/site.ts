import type {Locale} from '@/types/locale';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function parseSiteUrl(value: string): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a valid absolute URL');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('NEXT_PUBLIC_SITE_URL must use http or https');
  }
  if (url.username !== '' || url.password !== '') {
    throw new Error('NEXT_PUBLIC_SITE_URL must not contain credentials');
  }
  if (url.search !== '' || url.hash !== '') {
    throw new Error('NEXT_PUBLIC_SITE_URL must not contain a query or hash');
  }
  if (url.pathname !== '/') {
    throw new Error('NEXT_PUBLIC_SITE_URL must not contain a path');
  }

  url.pathname = '/';
  return url;
}

export function getSiteUrl(): URL {
  const configuredValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  return parseSiteUrl(configuredValue === undefined || configuredValue === '' ? DEFAULT_SITE_URL : configuredValue);
}

export function getLocalizedPath(locale: Locale, path: string): string {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

  return locale === 'ru' ? normalizedPath || '/' : `/en${normalizedPath}`;
}

export function getLocalizedAlternates(path: string): Record<string, string> {
  const siteUrl = getSiteUrl();
  const russianPath = getLocalizedPath('ru', path);
  const englishPath = getLocalizedPath('en', path);

  return {
    'ru-RU': new URL(russianPath, siteUrl).toString(),
    'en-US': new URL(englishPath, siteUrl).toString(),
    'x-default': new URL(russianPath, siteUrl).toString()
  };
}

export function getAbsoluteLocalizedPath(locale: Locale, path: string): string {
  return new URL(getLocalizedPath(locale, path), getSiteUrl()).toString();
}
