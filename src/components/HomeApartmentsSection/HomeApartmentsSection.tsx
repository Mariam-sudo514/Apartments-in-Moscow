import {getTranslations} from 'next-intl/server';

import {HomeApartmentsCarousel} from '@/components/HomeApartmentsCarousel';
import {getAllApartments, getLocalizedApartment} from '@/data/apartments';
import type {Locale} from '@/types/locale';

import styles from './HomeApartmentsSection.module.css';

type HomeApartmentsSectionProps = {
  readonly locale: Locale;
};

export async function HomeApartmentsSection({locale}: HomeApartmentsSectionProps) {
  const [homeT, apartmentT] = await Promise.all([
    getTranslations({locale, namespace: 'home.apartments'}),
    getTranslations({locale, namespace: 'apartments'})
  ]);

  const slides = getAllApartments().map((apartment) => {
    const localized = getLocalizedApartment(apartment, locale);
    const cover = localized.detail.gallery[0];

    return {
      address: localized.catalog.address,
      coverAlt: localized.catalog.cover.alt,
      coverPath: cover.plannedPublicPath,
      href: `/apartments/${localized.slug}`,
      name: localized.catalog.name,
      price: localized.catalog.price,
      shortDescription: localized.catalog.shortDescription,
      slug: localized.slug,
      type: localized.catalog.type
    };
  });

  return (
    <section
      aria-labelledby="home-apartments-title"
      className={styles.section}
    >
      <h2 className={styles.title} id="home-apartments-title">
        {homeT('title')}
      </h2>
      <HomeApartmentsCarousel
        locale={locale}
        labels={{
          carouselLabel: homeT('carouselLabel'),
          carouselRole: homeT('carouselRole'),
          from: apartmentT('from'),
          moreDetails: apartmentT('moreDetails'),
          next: homeT('next'),
          paginationBullet: homeT('paginationBullet'),
          perDay: apartmentT('perDay'),
          previous: homeT('previous'),
          slideLabelOf: homeT('slideLabelOf'),
          slideLabelPrefix: homeT('slideLabelPrefix')
        }}
        slides={slides}
      />
    </section>
  );
}
