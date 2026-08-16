import {describe, expect, it} from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

describe('SEO route invariants', () => {
  it('publishes exactly 32 localized public URLs with no forbidden routes', () => {
    const entries = sitemap();
    const urls = entries.map(({url}) => url);

    expect(entries).toHaveLength(32);
    expect(new Set(urls).size).toBe(32);
    expect(urls.some((url) => url.includes('/api/'))).toBe(false);
    expect(urls.some((url) => url.includes('.html'))).toBe(false);
    expect(urls.some((url) => url.includes('/de'))).toBe(false);
    expect(urls.every((url) => url.startsWith('http://localhost:3000/'))).toBe(true);
    expect(urls.filter((url) => new URL(url).pathname === '/en' || new URL(url).pathname.startsWith('/en/'))).toHaveLength(16);
    expect(urls.filter((url) => new URL(url).pathname !== '/en' && !new URL(url).pathname.startsWith('/en/'))).toHaveLength(16);
  });

  it('keeps localized alternates distinct and tied to each public entry', () => {
    for (const entry of sitemap()) {
      const alternates = Object.values(entry.alternates?.languages ?? {})
        .filter((value): value is string => value !== undefined);

      expect(new Set(alternates).size).toBe(2);
      expect(entry.alternates?.languages?.['x-default']).toBe(entry.alternates?.languages?.['ru-RU']);
      expect(entry.alternates?.languages?.['ru-RU']).not.toBe(entry.alternates?.languages?.['en-US']);
      expect(alternates.every((value) => value.startsWith('http://localhost:3000/'))).toBe(true);
    }
  });

  it('allows public pages and disallows the API path in robots', () => {
    const result = robots();

    expect(result.rules).toEqual({allow: '/', disallow: ['/api/'], userAgent: '*'});
    expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml');
  });
});
