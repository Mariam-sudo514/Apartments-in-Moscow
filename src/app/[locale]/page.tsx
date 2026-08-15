import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';

import {ContactsTeaser} from '@/components/ContactsTeaser';
import {HomeApartmentsSection} from '@/components/HomeApartmentsSection';
import {HomeBookingSection} from '@/components/HomeBookingSection';
import {HomeHero} from '@/components/HomeHero';
import {WhyChoose} from '@/components/WhyChoose';
import {isLocale, type Locale} from '@/types/locale';
import {notFound} from 'next/navigation';
import {createPageMetadata} from '@/lib/seo/metadata';

type HomePageProps = {
  readonly params: Promise<{locale: string}>;
};

function getRouteLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export async function generateMetadata({params}: HomePageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);
  const t = await getTranslations({locale, namespace: 'metadata'});

  return createPageMetadata({
    description: t('homeDescription'),
    locale,
    path: '/',
    title: t('homeTitle')
  });
}

export default async function HomePage({params}: HomePageProps) {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);

  return (
    <>
      <HomeHero />
      <WhyChoose />
      <HomeApartmentsSection locale={locale} />
      <HomeBookingSection locale={locale} />
      <ContactsTeaser />
    </>
  );
}
