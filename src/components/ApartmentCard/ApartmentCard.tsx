import Image from 'next/image';

import {Link} from '@/i18n/navigation';
import type {ApartmentPrice, LocalizedApartmentView} from '@/types/apartment';

import styles from './ApartmentCard.module.css';

type ApartmentCardLabels = {
  readonly moreDetails: string;
  readonly perDay: string;
  readonly from: string;
};

type ApartmentCardProps = {
  readonly apartment: LocalizedApartmentView;
  readonly labels: ApartmentCardLabels;
};

function formatPrice(price: ApartmentPrice, locale: LocalizedApartmentView['locale']): string {
  return new Intl.NumberFormat(locale, {
    currency: price.currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price.amount);
}

export function ApartmentCard({apartment, labels}: ApartmentCardProps) {
  const cover = apartment.detail.gallery[0];

  return (
    <article className={styles.card}>
      <div className={styles.imageFrame}>
        <Image
          alt={apartment.catalog.cover.alt}
          className={styles.image}
          fill
          priority={apartment.catalogOrder === 1}
          sizes="(max-width: 800px) calc(100vw - 50px), (max-width: 1000px) calc(50vw - 45px), 330px"
          src={cover.plannedPublicPath}
        />
        <p className={styles.tag}>{apartment.catalog.type}</p>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{apartment.catalog.address}</h2>
        <p className={styles.description}>{apartment.catalog.shortDescription}</p>

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <p className={styles.price}>
              {apartment.catalog.price.mode === 'from' ? `${labels.from} ` : ''}
              {formatPrice(apartment.catalog.price, apartment.locale)}
            </p>
            <p className={styles.priceRole}>{labels.perDay}</p>
          </div>

          <Link className={styles.button} href={`/apartments/${apartment.slug}`}>
            {labels.moreDetails}
          </Link>
        </div>
      </div>
    </article>
  );
}
