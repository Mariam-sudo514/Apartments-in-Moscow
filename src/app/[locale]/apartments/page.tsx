import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

import {ApartmentCatalog} from '@/components/ApartmentCatalog';
import {Breadcrumbs} from '@/components/Breadcrumbs';
import {
  getAllApartments,
  getLocalizedApartment
} from '@/data/apartments';
import {isLocale, type Locale} from '@/types/locale';

type ApartmentsPageProps = {
  readonly params: Promise<{locale: string}>;
};

function getRouteLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export async function generateMetadata({params}: ApartmentsPageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);
  const t = await getTranslations({locale, namespace: 'metadata'});

  return {
    title: t('catalogTitle'),
    description: t('catalogDescription')
  };
}

export default async function ApartmentsPage({params}: ApartmentsPageProps) {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);
  const t = await getTranslations({locale, namespace: 'apartments'});
  const apartments = getAllApartments().map((apartment) =>
    getLocalizedApartment(apartment, locale)
  );

  return (
    <>
      <Breadcrumbs
        ariaLabel={t('breadcrumbs.ariaLabel')}
        items={[
          {href: '/', label: t('breadcrumbs.home')},
          {label: t('breadcrumbs.apartments')}
        ]}
      />
      <ApartmentCatalog
        apartments={apartments}
        labels={{
          from: t('from'),
          moreDetails: t('moreDetails'),
          perDay: t('perDay'),
          title: t('title')
        }}
      />
    </>
  );
}
