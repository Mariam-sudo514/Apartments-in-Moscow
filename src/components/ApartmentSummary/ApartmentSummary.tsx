import {Link} from '@/i18n/navigation';
import type {ApartmentPrice, LocalizedApartmentView} from '@/types/apartment';

import styles from './ApartmentSummary.module.css';

type ApartmentSummaryLabels = {
  readonly bookingCta: string;
  readonly from: string;
  readonly perDay: string;
};

type ApartmentSummaryProps = {
  readonly apartment: LocalizedApartmentView;
  readonly labels: ApartmentSummaryLabels;
};

function formatPrice(price: ApartmentPrice, locale: LocalizedApartmentView['locale']): string {
  return new Intl.NumberFormat(locale, {
    currency: price.currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price.amount);
}

export function ApartmentSummary({apartment, labels}: ApartmentSummaryProps) {
  const {price} = apartment.detail;

  return (
    <section aria-label={apartment.catalog.type} className={styles.block}>
      <p className={styles.type}>{apartment.catalog.type}</p>
      <p className={styles.price}>
        {price.mode === 'from' ? `${labels.from} ` : ''}
        {formatPrice(price, apartment.locale)}{' '}
        <span className={styles.separator}>/</span>{' '}
        <span className={styles.perDay}>{labels.perDay}</span>
      </p>
      <p className={styles.address}>{apartment.detail.address}</p>
      <p className={styles.description}>{apartment.detail.description}</p>
      <div className={styles.linkBlock}>
        <Link className={styles.button} href="/reservation">
          {labels.bookingCta}
        </Link>
      </div>
    </section>
  );
}
