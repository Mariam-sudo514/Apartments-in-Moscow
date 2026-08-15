import type {Metadata} from 'next';

import {
  getAbsoluteLocalizedPath,
  getLocalizedAlternates,
  getLocalizedPath,
  getSiteUrl
} from '@/config/site';
import type {Locale} from '@/types/locale';

type PageMetadataInput = {
  readonly description: string;
  readonly locale: Locale;
  readonly path: string;
  readonly title: string;
};

export function createPageMetadata({
  description,
  locale,
  path,
  title
}: PageMetadataInput): Metadata {
  const canonicalPath = getLocalizedPath(locale, path);
  const openGraphLocale = locale === 'ru' ? 'ru_RU' : 'en_US';
  const alternateLocale = locale === 'ru' ? ['en_US'] : ['ru_RU'];

  return {
    metadataBase: getSiteUrl(),
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: getLocalizedAlternates(path)
    },
    openGraph: {
      alternateLocale,
      description,
      locale: openGraphLocale,
      title,
      type: 'website',
      url: getAbsoluteLocalizedPath(locale, path)
    },
    twitter: {
      card: 'summary'
    }
  };
}
