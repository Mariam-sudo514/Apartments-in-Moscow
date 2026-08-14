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
    today: t('today')
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
