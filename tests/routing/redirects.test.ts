import {describe, expect, it} from 'vitest';

import {legacyRedirects} from '@/config/legacy-redirects';
import {getApartmentBySlug} from '@/data/apartments';

describe('legacy redirect allowlist', () => {
  it('contains exactly the confirmed sixteen local redirects', () => {
    expect(legacyRedirects).toHaveLength(16);
    expect(new Set(legacyRedirects.map(({source}) => source)).size).toBe(16);
    expect(legacyRedirects.map(({source}) => source)).toContain('/apartaments.html');
    expect(legacyRedirects.map(({source}) => source)).not.toContain('/apartments.html');
    expect(legacyRedirects.every(({destination}) => destination.startsWith('/'))).toBe(true);
  });

  it('maps every apartment legacy page to an existing typed slug', () => {
    const apartmentRedirects = legacyRedirects.filter(({destination}) => destination.startsWith('/apartments/'));

    expect(apartmentRedirects).toHaveLength(12);
    for (const {destination} of apartmentRedirects) {
      const slug = destination.replace('/apartments/', '');

      expect(getApartmentBySlug(slug)).toBeDefined();
    }
  });
});
