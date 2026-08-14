import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {HomeBookingForm} from '@/components/HomeBookingForm';
import {getAllApartments, getLocalizedApartment} from '@/data/apartments';
import type {HomeBookingLabels, HomeBookingApartmentOption} from '@/types/booking';
import type {Locale} from '@/types/locale';

import styles from './HomeBookingSection.module.css';

type HomeBookingSectionProps = {
  readonly locale: Locale;
};

export async function HomeBookingSection({locale}: HomeBookingSectionProps) {
  const t = await getTranslations({locale, namespace: 'home.booking'});
  const apartments: readonly HomeBookingApartmentOption[] = getAllApartments().map((apartment) => {
    const localized = getLocalizedApartment(apartment, locale);

    return {
      address: localized.catalog.address,
      label: localized.catalog.name,
      slug: localized.slug
    };
  });
  const labels: HomeBookingLabels = {
    apartmentLabel: t('apartmentLabel'),
    apartmentPlaceholder: t('apartmentPlaceholder'),
    apartmentRequired: t('apartmentRequired'),
    bookingDetailsTitle: t('bookingDetailsTitle'),
    checkInLabel: t('checkInLabel'),
    checkInPast: t('checkInPast'),
    checkInRequired: t('checkInRequired'),
    checkOutAfterCheckIn: t('checkOutAfterCheckIn'),
    checkOutLabel: t('checkOutLabel'),
    checkOutRequired: t('checkOutRequired'),
    contactTitle: t('contactTitle'),
    description: t('description'),
    errorSummaryTitle: t('errorSummaryTitle'),
    guestNameControlCharacters: t('guestNameControlCharacters'),
    guestNameLabel: t('guestNameLabel'),
    guestNamePlaceholder: t('guestNamePlaceholder'),
    guestNameRequired: t('guestNameRequired'),
    guestNameTooLong: t('guestNameTooLong'),
    guestNameTooShort: t('guestNameTooShort'),
    guestPhoneFormat: t('guestPhoneFormat'),
    guestPhoneLabel: t('guestPhoneLabel'),
    guestPhonePlaceholder: t('guestPhonePlaceholder'),
    guestPhoneRequired: t('guestPhoneRequired'),
    guestPhoneTooLong: t('guestPhoneTooLong'),
    guestPhoneTooShort: t('guestPhoneTooShort'),
    reservationIncomplete: t('reservationIncomplete'),
    review: t('review'),
    reviewDisabledHint: t('reviewDisabledHint'),
    reviewedMessage: t('reviewedMessage'),
    title: t('title'),
    todayInitializing: t('todayInitializing')
  };

  return (
    <section aria-labelledby="home-booking-title" className={styles.section}>
      <Container>
        <HomeBookingForm apartments={apartments} labels={labels} locale={locale} />
      </Container>
    </section>
  );
}
