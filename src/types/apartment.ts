import type { Locale } from './locale';

export type LocalizedText = Readonly<Record<Locale, string>>;

export type ApartmentPriceMode = 'exact' | 'from';

export type ApartmentPrice = {
  readonly amount: number;
  readonly currency: 'RUB';
  readonly mode: ApartmentPriceMode;
};

export type ApartmentAsset = {
  readonly legacyPath: string;
  readonly plannedPublicPath: string;
  readonly alt: LocalizedText;
};

export type ApartmentGalleryImage = ApartmentAsset & {
  readonly order: number;
};

export type ApartmentSection = {
  readonly title: LocalizedText;
  readonly paragraphs: readonly LocalizedText[];
  readonly items: readonly LocalizedText[];
};

export type ApartmentMapData = {
  readonly provider: 'yandex';
  readonly embedUrl: string;
  readonly title: LocalizedText;
};

export type ApartmentCatalogData = {
  readonly name: LocalizedText;
  readonly type: LocalizedText;
  readonly address: LocalizedText;
  readonly shortDescription: LocalizedText;
  readonly price: ApartmentPrice;
  readonly cover: ApartmentAsset;
};

export type ApartmentDetailData = {
  readonly title: LocalizedText;
  readonly address: LocalizedText;
  readonly description: LocalizedText;
  readonly sections: readonly ApartmentSection[];
  readonly rules: readonly LocalizedText[];
  readonly checkIn: LocalizedText;
  readonly checkOut: LocalizedText;
  readonly amenities: readonly LocalizedText[];
  readonly price: ApartmentPrice;
  readonly gallery: readonly ApartmentGalleryImage[];
  readonly map: ApartmentMapData;
};

export type ApartmentSource = {
  readonly catalogPage: string;
  readonly detailPage: string;
  readonly catalogCoverPath: string;
  readonly detailGalleryDirectory: string;
  readonly variantNotes?: readonly LocalizedText[];
};

export type ApartmentRecord = {
  readonly slug: string;
  readonly legacyFilename: string;
  readonly catalogOrder: number;
  readonly catalog: ApartmentCatalogData;
  readonly detail: ApartmentDetailData;
  readonly source: ApartmentSource;
};

export type LocalizedApartmentAsset = Omit<ApartmentAsset, 'alt'> & {
  readonly alt: string;
};

export type LocalizedApartmentGalleryImage = Omit<ApartmentGalleryImage, 'alt'> & {
  readonly alt: string;
};

export type LocalizedApartmentSection = {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly items: readonly string[];
};

export type LocalizedApartmentView = {
  readonly locale: Locale;
  readonly slug: string;
  readonly legacyFilename: string;
  readonly catalogOrder: number;
  readonly catalog: {
    readonly name: string;
    readonly type: string;
    readonly address: string;
    readonly shortDescription: string;
    readonly price: ApartmentPrice;
    readonly cover: LocalizedApartmentAsset;
  };
  readonly detail: {
    readonly title: string;
    readonly address: string;
    readonly description: string;
    readonly sections: readonly LocalizedApartmentSection[];
    readonly rules: readonly string[];
    readonly checkIn: string;
    readonly checkOut: string;
    readonly amenities: readonly string[];
    readonly price: ApartmentPrice;
    readonly gallery: readonly LocalizedApartmentGalleryImage[];
    readonly map: {
      readonly provider: ApartmentMapData['provider'];
      readonly embedUrl: string;
      readonly title: string;
    };
  };
};
