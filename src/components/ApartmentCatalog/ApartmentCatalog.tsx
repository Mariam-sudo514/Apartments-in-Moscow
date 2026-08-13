import type {LocalizedApartmentView} from '@/types/apartment';

import {ApartmentCard} from '@/components/ApartmentCard';

import styles from './ApartmentCatalog.module.css';

type ApartmentCatalogLabels = {
  readonly title: string;
  readonly moreDetails: string;
  readonly perDay: string;
  readonly from: string;
};

type ApartmentCatalogProps = {
  readonly apartments: readonly LocalizedApartmentView[];
  readonly labels: ApartmentCatalogLabels;
};

export function ApartmentCatalog({apartments, labels}: ApartmentCatalogProps) {
  return (
    <section aria-labelledby="apartments-title" className={styles.section}>
      <h1 className={styles.visuallyHidden} id="apartments-title">
        {labels.title}
      </h1>
      <div className={styles.wrapper}>
        {apartments.map((apartment) => (
          <ApartmentCard
            apartment={apartment}
            key={apartment.slug}
            labels={labels}
          />
        ))}
      </div>
    </section>
  );
}
