import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

import {Breadcrumbs} from '@/components/Breadcrumbs';
import {ReservationPageContent} from '@/components/ReservationPageContent';
import {isLocale, type Locale} from '@/types/locale';

export const dynamic = 'force-dynamic';

type ReservationPageProps = {
  readonly params: Promise<{locale: string}>;
};

function getRouteLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export async function generateMetadata({params}: ReservationPageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);
  const t = await getTranslations({locale, namespace: 'metadata'});

  return {
    description: t('reservationDescription'),
    title: t('reservationTitle')
  };
}

export default async function ReservationPage({params}: ReservationPageProps) {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);
  const t = await getTranslations({locale, namespace: 'reservation'});

  return (
    <>
      <Breadcrumbs
        ariaLabel={t('breadcrumbs.ariaLabel')}
        items={[
          {href: '/', label: t('breadcrumbs.home')},
          {label: t('breadcrumbs.reservation')}
        ]}
      />
      <ReservationPageContent locale={locale} />
    </>
  );
}
