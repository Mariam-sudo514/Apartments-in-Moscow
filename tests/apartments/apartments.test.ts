import {describe, expect, it} from 'vitest';

import {
  apartmentSlugExists,
  getApartments,
  getAllApartments,
  getApartmentBySlug,
  getApartmentSlugs,
  getLocalizedApartment,
  getLocalizedApartmentBySlug,
  validateApartments
} from '@/data/apartments';
import type {ApartmentRecord} from '@/types/apartment';

const expectedSlugs = [
  'dmitrovskoe-107-apt-1',
  'dmitrovskoe-107-apt-2',
  'altufyevskoe-2-apt-3',
  'altufyevskoe-2-apt-4',
  'altufyevskoe-2-apt-5',
  'dmitrovskoe-107-apt-6',
  'dmitrovskoe-107-apt-7',
  'dmitrovskoe-107-apt-8',
  'beskudnikovsky-31-apt-9',
  'beskudnikovsky-52-apt-10',
  'beskudnikovsky-58-apt-11',
  'mitino-aframe'
] as const;

type DeepMutable<T> = T extends object ? {-readonly [Key in keyof T]: DeepMutable<T[Key]>} : T;

describe('typed apartment data', () => {
  it('keeps the twelve published records in catalog order', () => {
    const apartments = getAllApartments();

    expect(apartments).toHaveLength(12);
    expect(getApartments()).toBe(apartments);
    expect(getApartmentSlugs()).toEqual(expectedSlugs);
    expect(apartmentSlugExists(expectedSlugs[0])).toBe(true);
    expect(apartments.map(({slug}) => slug)).toEqual(expectedSlugs);
    expect(new Set(apartments.map(({slug}) => slug)).size).toBe(12);
    expect(apartments.map(({catalogOrder}) => catalogOrder)).toEqual(
      Array.from({length: 12}, (_, index) => index + 1)
    );
  });

  it('has localized catalog and detail views with supported prices and manifests', () => {
    const apartments = getAllApartments();
    const priceModes = new Set<string>();

    for (const apartment of apartments) {
      const russian = getLocalizedApartment(apartment, 'ru');
      const english = getLocalizedApartment(apartment, 'en');
      const galleryPaths = apartment.detail.gallery.map(({plannedPublicPath}) => plannedPublicPath);

      expect(russian.catalog.name).not.toBe(english.catalog.name);
      expect(russian.catalog.address).not.toBe('');
      expect(english.catalog.address).not.toBe('');
      expect(russian.detail.title).not.toBe('');
      expect(english.detail.title).not.toBe('');
      expect(apartment.detail.gallery.length).toBeGreaterThan(0);
      expect(new Set(galleryPaths).size).toBe(galleryPaths.length);
      expect(apartment.catalog.cover.legacyPath).toBe(apartment.source.catalogCoverPath);
      expect(apartment.catalog.price.currency).toBe('RUB');
      expect(apartment.detail.price.currency).toBe('RUB');
      priceModes.add(apartment.catalog.price.mode);
    }

    expect(priceModes).toEqual(new Set(['exact', 'from']));
  });

  it('passes the data validator and returns undefined for an unknown slug', () => {
    expect(() => validateApartments()).not.toThrow();
    expect(getApartmentBySlug('not-a-real-apartment')).toBeUndefined();
    expect(apartmentSlugExists('not-a-real-apartment')).toBe(false);
    expect(getLocalizedApartmentBySlug('not-a-real-apartment', 'en')).toBeUndefined();
    expect(getLocalizedApartmentBySlug(expectedSlugs[0], 'en')?.locale).toBe('en');
  });

  it('reports malformed manifests and duplicate identity/asset fields', () => {
    expect(() => validateApartments([])).toThrow(/Apartment data validation failed/);

    const records = structuredClone(getAllApartments()) as unknown as DeepMutable<ApartmentRecord>[];
    const first = records[0];
    const second = records[1];

    first.slug = '';
    first.legacyFilename = '';
    first.catalogOrder = 0;
    first.catalog.price.amount = 0;
    first.catalog.price.currency = 'USD' as typeof first.catalog.price.currency;
    first.catalog.price.mode = 'invalid' as typeof first.catalog.price.mode;
    first.detail.price.currency = 'USD' as typeof first.detail.price.currency;
    first.detail.price.mode = 'invalid' as typeof first.detail.price.mode;
    first.source.detailPage = 'different.html';
    first.source.catalogCoverPath = 'different.png';
    first.catalog.cover.legacyPath = '/bad\\../legacy.png';
    first.catalog.cover.plannedPublicPath = '/images/тест path\\../cover.png';
    first.catalog.name.ru = '';
    first.detail.title.ru = '';
    first.detail.gallery[0].order = 2;
    first.detail.gallery[0].legacyPath = 'wrong/1.jpeg';
    first.detail.gallery[0].alt.ru = '';
    first.detail.gallery.pop();
    first.legacyFilename = 'unknown.html';
    second.slug = first.slug;
    second.legacyFilename = first.legacyFilename;
    second.catalogOrder = first.catalogOrder;
    second.catalog.cover.legacyPath = first.catalog.cover.legacyPath;
    second.catalog.cover.plannedPublicPath = first.catalog.cover.plannedPublicPath;

    expect(() => validateApartments(records)).toThrow(/Apartment data validation failed/);
  });
});
