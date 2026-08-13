import {ContactsTeaser} from '@/components/ContactsTeaser';
import {HomeApartmentsSection} from '@/components/HomeApartmentsSection';
import {HomeHero} from '@/components/HomeHero';
import {WhyChoose} from '@/components/WhyChoose';
import {isLocale, type Locale} from '@/types/locale';
import {notFound} from 'next/navigation';

type HomePageProps = {
  readonly params: Promise<{locale: string}>;
};

function getRouteLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export default async function HomePage({params}: HomePageProps) {
  const {locale: rawLocale} = await params;
  const locale = getRouteLocale(rawLocale);

  return (
    <>
      <HomeHero />
      <WhyChoose />
      <HomeApartmentsSection locale={locale} />
      <ContactsTeaser />
    </>
  );
}
