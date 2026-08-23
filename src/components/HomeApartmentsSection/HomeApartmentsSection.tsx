import {getTranslations} from 'next-intl/server';

import {HomeApartmentsCarousel} from '@/components/HomeApartmentsCarousel';
import type {Locale} from '@/types/locale';

import {getLocalizedLegacyHomeApartments} from './legacy-home-apartments';
import styles from './HomeApartmentsSection.module.css';

type HomeApartmentsSectionProps = {
  readonly locale: Locale;
};

export async function HomeApartmentsSection({locale}: HomeApartmentsSectionProps) {
  const homeT = await getTranslations({locale, namespace: 'home.apartments'});

  return (
    <>
      <div className={styles.titleBlock}>
        <h1 className={styles.title} id="apartments">
          {homeT('title')}
        </h1>
      </div>
      <HomeApartmentsCarousel slides={getLocalizedLegacyHomeApartments(locale)} />
    </>
  );
}
