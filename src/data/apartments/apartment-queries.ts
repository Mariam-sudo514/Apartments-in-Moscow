import { locales, type Locale } from '@/types/locale';
import type {
  ApartmentRecord,
  LocalizedApartmentView,
  LocalizedText,
} from '@/types/apartment';
import { apartments } from './apartments';

const expectedDetailFiles = [
  'apartament780.html',
  'apartament755.html',
  'apartament1202.html',
  'apartament1204.html',
  'apartament1206.html',
  'apartament759.html',
  'ap.html',
  'apartament794.html',
  'apartament230.html',
  'apartament170.html',
  'apartament58-230.html',
  'apartament12.html',
] as const;

const expectedGalleryCounts: Readonly<Record<string, number>> = {
  'apartament780.html': 11,
  'apartament755.html': 6,
  'apartament1202.html': 8,
  'apartament1204.html': 8,
  'apartament1206.html': 10,
  'apartament759.html': 6,
  'ap.html': 6,
  'apartament794.html': 7,
  'apartament230.html': 6,
  'apartament170.html': 11,
  'apartament58-230.html': 11,
  'apartament12.html': 18,
};

const expectedCatalogCovers = Array.from({ length: 12 }, (_, index) => `img/main/${index + 1}.png`);

const pick = (value: LocalizedText, locale: Locale): string => value[locale];

export function getAllApartments(): typeof apartments {
  return apartments;
}

export const getApartments = getAllApartments;

export function getApartmentBySlug(slug: string): ApartmentRecord | undefined {
  return apartments.find((apartment) => apartment.slug === slug);
}

export function apartmentSlugExists(slug: string): boolean {
  return getApartmentBySlug(slug) !== undefined;
}

export const hasApartmentSlug = apartmentSlugExists;

export function getApartmentSlugs(): readonly string[] {
  return apartments.map((apartment) => apartment.slug);
}

export function getLocalizedApartment(
  apartment: ApartmentRecord,
  locale: Locale,
): LocalizedApartmentView {
  return {
    locale,
    slug: apartment.slug,
    legacyFilename: apartment.legacyFilename,
    catalogOrder: apartment.catalogOrder,
    catalog: {
      name: pick(apartment.catalog.name, locale),
      type: pick(apartment.catalog.type, locale),
      address: pick(apartment.catalog.address, locale),
      shortDescription: pick(apartment.catalog.shortDescription, locale),
      price: apartment.catalog.price,
      cover: {
        legacyPath: apartment.catalog.cover.legacyPath,
        plannedPublicPath: apartment.catalog.cover.plannedPublicPath,
        alt: pick(apartment.catalog.cover.alt, locale),
      },
    },
    detail: {
      title: pick(apartment.detail.title, locale),
      address: pick(apartment.detail.address, locale),
      description: pick(apartment.detail.description, locale),
      sections: apartment.detail.sections.map((item) => ({
        title: pick(item.title, locale),
        paragraphs: item.paragraphs.map((paragraph) => pick(paragraph, locale)),
        items: item.items.map((entry) => pick(entry, locale)),
      })),
      rules: apartment.detail.rules.map((rule) => pick(rule, locale)),
      checkIn: pick(apartment.detail.checkIn, locale),
      checkOut: pick(apartment.detail.checkOut, locale),
      amenities: apartment.detail.amenities.map((amenity) => pick(amenity, locale)),
      price: apartment.detail.price,
      gallery: apartment.detail.gallery.map((image) => ({
        order: image.order,
        legacyPath: image.legacyPath,
        plannedPublicPath: image.plannedPublicPath,
        alt: pick(image.alt, locale),
      })),
      map: {
        provider: apartment.detail.map.provider,
        embedUrl: apartment.detail.map.embedUrl,
        title: pick(apartment.detail.map.title, locale),
      },
    },
  };
}

export function getLocalizedApartmentBySlug(
  slug: string,
  locale: Locale,
): LocalizedApartmentView | undefined {
  const apartment = getApartmentBySlug(slug);

  return apartment === undefined ? undefined : getLocalizedApartment(apartment, locale);
}

function addLocalizedTextErrors(value: LocalizedText, label: string, errors: string[]): void {
  for (const locale of locales) {
    if (value[locale].trim() === '') {
      errors.push(`${label}.${locale} is empty`);
    }
  }
}

function addAssetPathErrors(
  path: string,
  label: string,
  errors: string[],
  allowPublicRoot: boolean,
): void {
  const isPublicPath = allowPublicRoot && path.startsWith('/images/');
  const isRelativePath = !path.startsWith('/') && !/^[A-Za-z]:/.test(path);

  if (!isPublicPath && !isRelativePath) {
    errors.push(`${label} must be relative or use the planned /images/ public root`);
  }
  if (path.includes('\\')) {
    errors.push(`${label} must not contain backslashes`);
  }
  if (path.split('/').includes('..')) {
    errors.push(`${label} must not contain parent-directory segments`);
  }
  if (allowPublicRoot && !/^[\x00-\x7F]+$/.test(path)) {
    errors.push(`${label} must contain ASCII characters only`);
  }
  if (allowPublicRoot && /\s/.test(path)) {
    errors.push(`${label} must not contain whitespace`);
  }
}

function addRecordLocalizedTextErrors(record: ApartmentRecord, errors: string[]): void {
  const localizedFields: readonly [string, LocalizedText][] = [
    ['catalog.name', record.catalog.name],
    ['catalog.type', record.catalog.type],
    ['catalog.address', record.catalog.address],
    ['catalog.shortDescription', record.catalog.shortDescription],
    ['catalog.cover.alt', record.catalog.cover.alt],
    ['detail.title', record.detail.title],
    ['detail.address', record.detail.address],
    ['detail.description', record.detail.description],
    ['detail.checkIn', record.detail.checkIn],
    ['detail.checkOut', record.detail.checkOut],
    ['detail.map.title', record.detail.map.title],
  ];

  for (const [label, value] of localizedFields) {
    addLocalizedTextErrors(value, `${record.slug}.${label}`, errors);
  }
  for (const [index, value] of record.detail.rules.entries()) {
    addLocalizedTextErrors(value, `${record.slug}.detail.rules[${index}]`, errors);
  }
  for (const [index, value] of record.detail.amenities.entries()) {
    addLocalizedTextErrors(value, `${record.slug}.detail.amenities[${index}]`, errors);
  }
  for (const [index, value] of record.detail.sections.entries()) {
    addLocalizedTextErrors(value.title, `${record.slug}.detail.sections[${index}].title`, errors);
    for (const [paragraphIndex, paragraph] of value.paragraphs.entries()) {
      addLocalizedTextErrors(paragraph, `${record.slug}.detail.sections[${index}].paragraphs[${paragraphIndex}]`, errors);
    }
    for (const [itemIndex, item] of value.items.entries()) {
      addLocalizedTextErrors(item, `${record.slug}.detail.sections[${index}].items[${itemIndex}]`, errors);
    }
  }
  for (const [index, image] of record.detail.gallery.entries()) {
    addLocalizedTextErrors(image.alt, `${record.slug}.detail.gallery[${index}].alt`, errors);
  }
  for (const [index, note] of (record.source.variantNotes ?? []).entries()) {
    addLocalizedTextErrors(note, `${record.slug}.source.variantNotes[${index}]`, errors);
  }
}

export function validateApartments(records: readonly ApartmentRecord[] = apartments): void {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const detailFiles = new Set<string>();
  const catalogOrders = new Set<number>();
  const legacyAssetPaths = new Set<string>();
  const publicAssetPaths = new Set<string>();

  if (records.length !== 12) {
    errors.push(`expected 12 apartment records, received ${records.length}`);
  }

  for (const record of records) {
    if (record.slug.trim() === '') {
      errors.push('slug must not be empty');
    }
    if (record.legacyFilename.trim() === '') {
      errors.push(`${record.slug} legacy filename must not be empty`);
    }
    if (slugs.has(record.slug)) {
      errors.push(`duplicate slug: ${record.slug}`);
    }
    slugs.add(record.slug);

    if (detailFiles.has(record.legacyFilename)) {
      errors.push(`duplicate legacy filename: ${record.legacyFilename}`);
    }
    detailFiles.add(record.legacyFilename);

    if (catalogOrders.has(record.catalogOrder)) {
      errors.push(`duplicate catalog order: ${record.catalogOrder}`);
    }
    catalogOrders.add(record.catalogOrder);

    if (record.catalogOrder < 1 || record.catalogOrder > 12) {
      errors.push(`${record.slug} catalog order must be between 1 and 12`);
    }

    for (const [label, price] of [
      ['catalog', record.catalog.price],
      ['detail', record.detail.price],
    ] as const) {
      if (!Number.isInteger(price.amount) || price.amount <= 0) {
        errors.push(`${record.slug}.${label}.price.amount must be a positive integer`);
      }
      if (price.currency !== 'RUB') {
        errors.push(`${record.slug}.${label}.price.currency must be RUB`);
      }
      if (price.mode !== 'exact' && price.mode !== 'from') {
        errors.push(`${record.slug}.${label}.price.mode is invalid`);
      }
    }

    if (record.source.detailPage !== record.legacyFilename) {
      errors.push(`${record.slug} source detail page must match legacy filename`);
    }
    if (record.source.catalogCoverPath !== record.catalog.cover.legacyPath) {
      errors.push(`${record.slug} source catalog cover must match catalog cover asset`);
    }

    addRecordLocalizedTextErrors(record, errors);

    const assets = [
      ['catalog.cover', record.catalog.cover.legacyPath, record.catalog.cover.plannedPublicPath],
      ...record.detail.gallery.map((image) => [
        `detail.gallery[${image.order}]`,
        image.legacyPath,
        image.plannedPublicPath,
      ] as const),
    ] as const;

    for (const [label, legacyPath, publicPath] of assets) {
      addAssetPathErrors(legacyPath, `${record.slug}.${label}.legacyPath`, errors, false);
      addAssetPathErrors(publicPath, `${record.slug}.${label}.plannedPublicPath`, errors, true);
      if (legacyAssetPaths.has(legacyPath)) {
        errors.push(`duplicate legacy asset path: ${legacyPath}`);
      }
      legacyAssetPaths.add(legacyPath);
      if (publicAssetPaths.has(publicPath)) {
        errors.push(`duplicate planned public asset path: ${publicPath}`);
      }
      publicAssetPaths.add(publicPath);
    }

    const expectedGalleryCount = expectedGalleryCounts[record.legacyFilename];
    if (expectedGalleryCount === undefined) {
      errors.push(`unexpected legacy detail filename: ${record.legacyFilename}`);
    } else if (record.detail.gallery.length !== expectedGalleryCount) {
      errors.push(`${record.slug} expected ${expectedGalleryCount} gallery images, received ${record.detail.gallery.length}`);
    }

    for (const [index, image] of record.detail.gallery.entries()) {
      const expectedOrder = index + 1;
      const expectedPath = `${record.source.detailGalleryDirectory}/${expectedOrder}.jpeg`;
      if (image.order !== expectedOrder) {
        errors.push(`${record.slug} gallery order must be contiguous from 1`);
      }
      if (image.legacyPath !== expectedPath) {
        errors.push(`${record.slug} gallery source path mismatch at order ${expectedOrder}`);
      }
    }
  }

  for (const expectedFile of expectedDetailFiles) {
    if (!detailFiles.has(expectedFile)) {
      errors.push(`missing expected legacy detail filename: ${expectedFile}`);
    }
  }
  for (const expectedCover of expectedCatalogCovers) {
    if (!legacyAssetPaths.has(expectedCover)) {
      errors.push(`missing expected catalog cover: ${expectedCover}`);
    }
  }
  for (let order = 1; order <= 12; order += 1) {
    if (!catalogOrders.has(order)) {
      errors.push(`missing catalog order: ${order}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Apartment data validation failed:\n${errors.join('\n')}`);
  }
}
