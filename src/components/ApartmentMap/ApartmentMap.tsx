import type {LocalizedApartmentView} from '@/types/apartment';

import styles from './ApartmentMap.module.css';

type ApartmentMapProps = {
  readonly map: LocalizedApartmentView['detail']['map'];
  readonly title: string;
};

export function ApartmentMap({map, title}: ApartmentMapProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.mapSection}>
        <div className={styles.mapFrame}>
          <iframe
            className={styles.map}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={map.embedUrl}
            title={map.title}
          />
        </div>
      </div>
    </section>
  );
}
