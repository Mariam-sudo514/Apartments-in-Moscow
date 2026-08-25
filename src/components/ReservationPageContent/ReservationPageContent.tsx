import {getTranslations} from 'next-intl/server';

import {BookingInstructions} from '@/components/BookingInstructions';
import {Container} from '@/components/Container';
import {getAllApartments, getLocalizedApartment} from '@/data/apartments';
import {getMoscowTodayIso} from '@/lib/reservation/calendar';
import type {Locale} from '@/types/locale';
import type {ReservationLabels, ReservationApartmentOption} from '@/types/reservation';

import {ReservationWidget} from '@/components/ReservationWidget';

import styles from './ReservationPageContent.module.css';

type ReservationPageContentProps = {
  readonly locale: Locale;
};

function getReservationLabels(
  t: Awaited<ReturnType<typeof getTranslations<'reservation'>>>
): ReservationLabels {
  return {
    adults: {
      few: t('adults.few'),
      many: t('adults.many'),
      one: t('adults.one'),
      other: t('adults.other')
    },
    adultsLabel: t('adultsLabel'),
    apartmentLabel: t('apartmentLabel'),
    apartmentOptionsLabel: t('apartmentOptionsLabel'),
    apartmentPlaceholder: t('apartmentPlaceholder'),
    calendarLabel: t('calendarLabel'),
    checkIn: t('checkIn'),
    checkOut: t('checkOut'),
    children: {
      few: t('children.few'),
      many: t('children.many'),
      one: t('children.one'),
      other: t('children.other')
    },
    childrenLabel: t('childrenLabel'),
    clear: t('clear'),
    countLabel: t('countLabel'),
    datesLabel: t('datesLabel'),
    datesPlaceholder: t('datesPlaceholder'),
    decreaseAdults: t('decreaseAdults'),
    decreaseChildren: t('decreaseChildren'),
    clearDates: t('clearDates'),
    done: t('done'),
    emptyValue: t('emptyValue'),
    from: t('from'),
    guestsLabel: t('guestsLabel'),
    increaseAdults: t('increaseAdults'),
    increaseChildren: t('increaseChildren'),
    instructions: t.raw('instructions') as readonly string[],
    instructionsTitle: t('instructionsTitle'),
    nextMonth: t('nextMonth'),
    nights: {
      few: t('nights.few'),
      many: t('nights.many'),
      one: t('nights.one'),
      other: t('nights.other')
    },
    pastDate: t('pastDate'),
    previousMonth: t('previousMonth'),
    preliminary: t('preliminary'),
    selectedRange: t('selectedRange'),
    selectCheckOut: t('selectCheckOut'),
    subtitle: t('subtitle'),
    summaryAdults: t('summaryAdults'),
    summaryApartment: t('summaryApartment'),
    summaryCheckIn: t('summaryCheckIn'),
    summaryCheckOut: t('summaryCheckOut'),
    summaryChildren: t('summaryChildren'),
    summaryEmpty: t('summaryEmpty'),
    summaryNights: t('summaryNights'),
    summaryTitle: t('summaryTitle'),
    summaryTotal: t('summaryTotal'),
    summaryUpdate: t('summaryUpdate'),
    title: t('title'),
    today: t('today'),
    booking: {
      captchaAlt: t('booking.captchaAlt'),
      captchaExpired: t('booking.captchaExpired'),
      captchaInvalid: t('booking.captchaInvalid'),
      captchaLabel: t('booking.captchaLabel'),
      captchaLoadFailed: t('booking.captchaLoadFailed'),
      captchaPlaceholder: t('booking.captchaPlaceholder'),
      captchaRefresh: t('booking.captchaRefresh'),
      captchaRequired: t('booking.captchaRequired'),
      description: t('booking.description'),
      errorSummaryTitle: t('booking.errorSummaryTitle'),
      apartmentRequired: t('booking.apartmentRequired'),
      checkInPast: t('booking.checkInPast'),
      checkInRequired: t('booking.checkInRequired'),
      checkOutAfterCheckIn: t('booking.checkOutAfterCheckIn'),
      checkOutRequired: t('booking.checkOutRequired'),
      guestNameControlCharacters: t('booking.guestNameControlCharacters'),
      guestNameLabel: t('booking.guestNameLabel'),
      guestNamePlaceholder: t('booking.guestNamePlaceholder'),
      guestNameRequired: t('booking.guestNameRequired'),
      guestNameTooLong: t('booking.guestNameTooLong'),
      guestNameTooShort: t('booking.guestNameTooShort'),
      guestEmailFormat: t('booking.guestEmailFormat'),
      guestEmailLabel: t('booking.guestEmailLabel'),
      guestEmailPlaceholder: t('booking.guestEmailPlaceholder'),
      guestEmailRequired: t('booking.guestEmailRequired'),
      guestPhoneFormat: t('booking.guestPhoneFormat'),
      guestPhoneLabel: t('booking.guestPhoneLabel'),
      guestPhonePlaceholder: t('booking.guestPhonePlaceholder'),
      guestPhoneRequired: t('booking.guestPhoneRequired'),
      guestPhoneTooLong: t('booking.guestPhoneTooLong'),
      guestPhoneTooShort: t('booking.guestPhoneTooShort'),
      emailOption: t('booking.emailOption'),
      preferredContactMethodLabel: t('booking.preferredContactMethodLabel'),
      preferredContactMethodPlaceholder: t('booking.preferredContactMethodPlaceholder'),
      preferredContactMethodRequired: t('booking.preferredContactMethodRequired'),
      preferredContactValueFormat: t('booking.preferredContactValueFormat'),
      telegramOption: t('booking.telegramOption'),
      telegramUsernameFormat: t('booking.telegramUsernameFormat'),
      telegramUsernameLabel: t('booking.telegramUsernameLabel'),
      telegramUsernamePlaceholder: t('booking.telegramUsernamePlaceholder'),
      telegramUsernameRequired: t('booking.telegramUsernameRequired'),
      whatsappNumberFormat: t('booking.whatsappNumberFormat'),
      whatsappNumberLabel: t('booking.whatsappNumberLabel'),
      whatsappNumberPlaceholder: t('booking.whatsappNumberPlaceholder'),
      whatsappNumberRequired: t('booking.whatsappNumberRequired'),
      whatsappOption: t('booking.whatsappOption'),
      reservationIncomplete: t('booking.reservationIncomplete'),
      sendRequest: t('booking.sendRequest'),
      sending: t('booking.sending'),
      successMessage: t('booking.successMessage'),
      networkFailure: t('booking.networkFailure'),
      invalidResponse: t('booking.invalidResponse'),
      requestInvalid: t('booking.requestInvalid'),
      requestForbidden: t('booking.requestForbidden'),
      requestPayloadTooLarge: t('booking.requestPayloadTooLarge'),
      requestUnsupportedMedia: t('booking.requestUnsupportedMedia'),
      requestValidationFailed: t('booking.requestValidationFailed'),
      requestRateLimited: t('booking.requestRateLimited'),
      serverMisconfigured: t('booking.serverMisconfigured'),
      deliveryNotConfigured: t('booking.deliveryNotConfigured'),
      deliveryFailed: t('booking.deliveryFailed'),
      retry: t('booking.retry'),
      todayInitializing: t('booking.todayInitializing'),
      title: t('booking.title')
    }
  };
}

function getApartmentOptions(locale: Locale): readonly ReservationApartmentOption[] {
  return getAllApartments().map((apartment) => {
    const localized = getLocalizedApartment(apartment, locale);

    return {
      address: localized.detail.address,
      currency: localized.catalog.price.currency,
      label: localized.catalog.name,
      price: localized.catalog.price.amount,
      priceMode: localized.catalog.price.mode,
      slug: localized.slug
    };
  });
}

export async function ReservationPageContent({locale}: ReservationPageContentProps) {
  const t = await getTranslations({locale, namespace: 'reservation'});
  const labels = getReservationLabels(t);

  return (
    <Container>
      <section aria-labelledby="reservation-page-title" className={styles.page}>
        <h1 className={styles.title} id="reservation-page-title">
          {labels.title}
        </h1>
        <p className={styles.subtitle}>{labels.subtitle}</p>
        <ReservationWidget
          apartments={getApartmentOptions(locale)}
          labels={labels}
          locale={locale}
          todayIso={getMoscowTodayIso()}
        >
          <BookingInstructions labels={labels} />
        </ReservationWidget>
      </section>
    </Container>
  );
}
