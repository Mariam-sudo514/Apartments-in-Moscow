import type {MetadataRoute} from 'next';

import {getLocalizedAlternates, getLocalizedPath, getSiteUrl} from '@/config/site';
import {getAllApartments} from '@/data/apartments';
import {locales, type Locale} from '@/types/locale';

const corePaths = ['/', '/apartments', '/contacts', '/reservation'] as const;

function createSitemapEntry(path: string, locale: Locale): MetadataRoute.Sitemap[number] {
  return {
    url: new URL(getLocalizedPath(locale, path), getSiteUrl()).toString(),
    alternates: {
      languages: getLocalizedAlternates(path)
    }
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const coreEntries = corePaths.flatMap((path) =>
    locales.map((locale) => createSitemapEntry(path, locale))
  );
  const detailEntries = getAllApartments().flatMap((apartment) =>
    locales.map((locale) =>
      createSitemapEntry(`/apartments/${apartment.slug}`, locale)
    )
  );

  return [...coreEntries, ...detailEntries];
}
