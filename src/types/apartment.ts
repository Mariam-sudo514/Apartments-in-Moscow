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

export type ApartmentDescriptionElement =
  | {
      readonly type: 'heading';
      readonly level: 1 | 2;
      readonly text: LocalizedText;
    }
  | {
      readonly type: 'paragraph';
      readonly text: LocalizedText;
      readonly variant?: 'default' | 'infrastructure' | 'indented';
    }
  | {
      readonly type: 'list';
      readonly items: readonly LocalizedText[];
    };

export type ApartmentRuleTiming = {
  readonly icon: 'checkIn' | 'checkOut';
  readonly text: LocalizedText;
};

export type ApartmentRulesBlock = {
  readonly title: LocalizedText;
  readonly timings: readonly ApartmentRuleTiming[];
  readonly elements: readonly ApartmentDescriptionElement[];
};

export type ApartmentMapLink = {
  readonly provider: 'yandex' | 'google' | 'apple';
  readonly href: string;
  readonly label: LocalizedText;
};

export type ApartmentMapData = {
  readonly provider: 'yandex';
  readonly embedUrl: string;
  readonly title: LocalizedText;
  readonly links: readonly ApartmentMapLink[];
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
  readonly descriptionElements: readonly ApartmentDescriptionElement[];
  readonly rulesBlock: ApartmentRulesBlock;
  readonly amenityColumns: readonly (readonly LocalizedText[])[];
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

export type LocalizedApartmentDescriptionElement =
  | {
      readonly type: 'heading';
      readonly level: 1 | 2;
      readonly text: string;
    }
  | {
      readonly type: 'paragraph';
      readonly text: string;
      readonly variant?: 'default' | 'infrastructure' | 'indented';
    }
  | {
      readonly type: 'list';
      readonly items: readonly string[];
    };

export type LocalizedApartmentRulesBlock = {
  readonly title: string;
  readonly timings: readonly {
    readonly icon: ApartmentRuleTiming['icon'];
    readonly text: string;
  }[];
  readonly elements: readonly LocalizedApartmentDescriptionElement[];
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
    readonly descriptionElements: readonly LocalizedApartmentDescriptionElement[];
    readonly rulesBlock: LocalizedApartmentRulesBlock;
    readonly amenityColumns: readonly (readonly string[])[];
    readonly price: ApartmentPrice;
    readonly gallery: readonly LocalizedApartmentGalleryImage[];
    readonly map: {
      readonly provider: ApartmentMapData['provider'];
      readonly embedUrl: string;
      readonly title: string;
      readonly links: readonly {
        readonly provider: ApartmentMapLink['provider'];
        readonly href: string;
        readonly label: string;
      }[];
    };
  };
};
