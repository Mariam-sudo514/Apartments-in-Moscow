import type {LocalizedApartmentView} from '@/types/apartment';

import styles from '@/components/ApartmentDescription/ApartmentDescription.module.css';

type ApartmentMapProps = {
  readonly map: LocalizedApartmentView['detail']['map'];
  readonly title: string;
};

export function ApartmentMap({map, title}: ApartmentMapProps) {
  return (
    <div className={`${styles.block} ${styles.blockMaps}`}>
      <h1 className={`${styles.title} ${styles.maps}`}>{title}</h1>
      <div className={styles.mapSection}>
        <div className={styles.mapFrame}>
          <iframe
            className={styles.map}
            height="400"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={map.embedUrl}
            title={map.title}
            width="500"
          />
        </div>
        <div className={styles.mapNavButtons}>
          {map.links.map((link) => (
            <a
              href={link.href}
              key={link.provider}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
