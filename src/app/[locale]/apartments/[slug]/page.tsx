import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

import {ApartmentAmenities} from '@/components/ApartmentAmenities';
import {ApartmentDescription} from '@/components/ApartmentDescription';
import {ApartmentGallery} from '@/components/ApartmentGallery';
import {ApartmentMap} from '@/components/ApartmentMap';
import {ApartmentRules} from '@/components/ApartmentRules';
import {ApartmentSummary} from '@/components/ApartmentSummary';
import {Breadcrumbs} from '@/components/Breadcrumbs';
import {
  getApartmentBySlug,
  getApartmentSlugs,
  getLocalizedApartment
} from '@/data/apartments';
import {locales, isLocale, type Locale} from '@/types/locale';

import styles from './page.module.css';

type ApartmentDetailPageProps = {
  readonly params: Promise<{locale: string; slug: string}>;
};

function getRouteLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getApartmentSlugs().map((slug) => ({locale, slug}))
  );
}

export async function generateMetadata({params}: ApartmentDetailPageProps): Promise<Metadata> {
  const {locale: rawLocale, slug} = await params;
  const locale = getRouteLocale(rawLocale);
  const apartment = getApartmentBySlug(slug);

  if (!apartment) {
    notFound();
  }

  const localized = getLocalizedApartment(apartment, locale);
  const t = await getTranslations({locale, namespace: 'metadata'});

  return {
    title: `${localized.detail.title} | ${t('detailSuffix')}`,
    description: localized.detail.description
  };
}

export default async function ApartmentDetailPage({
  params
}: ApartmentDetailPageProps) {
  const {locale: rawLocale, slug} = await params;
  const locale = getRouteLocale(rawLocale);
  const apartment = getApartmentBySlug(slug);

  if (!apartment) {
    notFound();
  }

  const localized = getLocalizedApartment(apartment, locale);
  const t = await getTranslations({locale, namespace: 'apartments'});

  return (
    <>
      <Breadcrumbs
        ariaLabel={t('breadcrumbs.ariaLabel')}
        items={[
          {href: '/', label: t('breadcrumbs.home')},
          {href: '/apartments', label: t('breadcrumbs.apartments')},
          {label: localized.detail.title}
        ]}
      />
      <div className={styles.page}>
        <div className={styles.hero}>
          <ApartmentGallery
            images={localized.detail.gallery}
            key={localized.slug}
            labels={{
              image: t('gallery.image'),
              next: t('gallery.next'),
              positionOf: t('gallery.positionOf'),
              positionPrefix: t('gallery.positionPrefix'),
              previous: t('gallery.previous'),
              region: t('gallery.region')
            }}
          />
          <ApartmentSummary
            apartment={localized}
            labels={{
              bookingCta: t('bookingCta'),
              from: t('from'),
              perDay: t('perDay')
            }}
          />
        </div>

        <ApartmentDescription
          sections={localized.detail.sections}
          title={localized.detail.title}
        />
        <ApartmentRules
          checkIn={localized.detail.checkIn}
          checkOut={localized.detail.checkOut}
          labels={{
            checkIn: t('detail.checkIn'),
            checkOut: t('detail.checkOut'),
            title: t('detail.rules')
          }}
          rules={localized.detail.rules}
        />
        <ApartmentAmenities
          amenities={localized.detail.amenities}
          title={t('detail.amenities')}
        />
        <ApartmentMap map={localized.detail.map} title={t('detail.map')} />
      </div>
    </>
  );
}
