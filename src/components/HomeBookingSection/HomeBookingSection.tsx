import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {HomeBookingForm} from '@/components/HomeBookingForm';
import {getAllApartments, getLocalizedApartment} from '@/data/apartments';
import type {HomeBookingLabels, HomeBookingApartmentOption} from '@/types/booking';
import type {Locale} from '@/types/locale';

type HomeBookingSectionProps = {
  readonly locale: Locale;
};

function getHomeApartmentLabel(
  locale: Locale,
  catalogOrder: number,
  address: string,
  type: string
): string {
  if (catalogOrder === 12) {
    return address.replace(/, (?:10Б|10B)$/u, '');
  }

  const legacyBuildingSuffix = catalogOrder === 4 || catalogOrder === 5
    ? locale === 'en' ? ', building 3' : ', корпус 3'
    : '';
  const apartmentUnitLabel = locale === 'en' ? 'apt.' : 'кв.';

  return `${address}${legacyBuildingSuffix}, ${type} ${apartmentUnitLabel} ${catalogOrder}`;
}

export async function HomeBookingSection({locale}: HomeBookingSectionProps) {
  const t = await getTranslations({locale, namespace: 'home.booking'});
  const apartments: readonly HomeBookingApartmentOption[] = getAllApartments().map((apartment) => {
    const localized = getLocalizedApartment(apartment, locale);

    return {
      address: localized.catalog.address,
      label: getHomeApartmentLabel(
        locale,
        localized.catalogOrder,
        localized.catalog.address,
        localized.catalog.type
      ),
      slug: localized.slug
    };
  });
  const labels: HomeBookingLabels = {
    apartmentLabel: t('apartmentLabel'),
    apartmentPlaceholder: t('apartmentPlaceholder'),
    apartmentRequired: t('apartmentRequired'),
    bookingDetailsTitle: t('bookingDetailsTitle'),
    calendarLabel: t('calendarLabel'),
    checkInLabel: t('checkInLabel'),
    checkInPast: t('checkInPast'),
    checkInRequired: t('checkInRequired'),
    checkOutAfterCheckIn: t('checkOutAfterCheckIn'),
    checkOutLabel: t('checkOutLabel'),
    checkOutRequired: t('checkOutRequired'),
    contactTitle: t('contactTitle'),
    clearDate: t('clearDate'),
    datePlaceholder: t('datePlaceholder'),
    captchaAlt: t('captchaAlt'),
    captchaExpired: t('captchaExpired'),
    captchaInvalid: t('captchaInvalid'),
    captchaLabel: t('captchaLabel'),
    captchaLoadFailed: t('captchaLoadFailed'),
    captchaPlaceholder: t('captchaPlaceholder'),
    captchaRefresh: t('captchaRefresh'),
    captchaRequired: t('captchaRequired'),
    description: t('description'),
    errorSummaryTitle: t('errorSummaryTitle'),
    guestNameControlCharacters: t('guestNameControlCharacters'),
    guestNameLabel: t('guestNameLabel'),
    guestNamePlaceholder: t('guestNamePlaceholder'),
    guestNameRequired: t('guestNameRequired'),
    guestNameTooLong: t('guestNameTooLong'),
    guestNameTooShort: t('guestNameTooShort'),
    guestEmailFormat: t('guestEmailFormat'),
    guestEmailLabel: t('guestEmailLabel'),
    guestEmailPlaceholder: t('guestEmailPlaceholder'),
    guestEmailRequired: t('guestEmailRequired'),
    preferredContactMethodLabel: t('preferredContactMethodLabel'),
    preferredContactMethodPlaceholder: t('preferredContactMethodPlaceholder'),
    preferredContactMethodRequired: t('preferredContactMethodRequired'),
    preferredContactValueFormat: t('preferredContactValueFormat'),
    emailOption: t('emailOption'),
    whatsappOption: t('whatsappOption'),
    telegramOption: t('telegramOption'),
    whatsappNumberLabel: t('whatsappNumberLabel'),
    whatsappNumberPlaceholder: t('whatsappNumberPlaceholder'),
    whatsappNumberRequired: t('whatsappNumberRequired'),
    whatsappNumberFormat: t('whatsappNumberFormat'),
    telegramUsernameLabel: t('telegramUsernameLabel'),
    telegramUsernamePlaceholder: t('telegramUsernamePlaceholder'),
    telegramUsernameRequired: t('telegramUsernameRequired'),
    telegramUsernameFormat: t('telegramUsernameFormat'),
    reservationIncomplete: t('reservationIncomplete'),
    sendRequest: t('sendRequest'),
    sending: t('sending'),
    successMessage: t('successMessage'),
    networkFailure: t('networkFailure'),
    nextMonth: t('nextMonth'),
    invalidResponse: t('invalidResponse'),
    requestInvalid: t('requestInvalid'),
    requestForbidden: t('requestForbidden'),
    requestPayloadTooLarge: t('requestPayloadTooLarge'),
    requestUnsupportedMedia: t('requestUnsupportedMedia'),
    requestValidationFailed: t('requestValidationFailed'),
    requestRateLimited: t('requestRateLimited'),
    previousMonth: t('previousMonth'),
    serverMisconfigured: t('serverMisconfigured'),
    deliveryNotConfigured: t('deliveryNotConfigured'),
    deliveryFailed: t('deliveryFailed'),
    retry: t('retry'),
    title: t('title'),
    todayInitializing: t('todayInitializing'),
    today: t('today')
  };

  return (
    <Container>
      <HomeBookingForm apartments={apartments} labels={labels} locale={locale} />
    </Container>
  );
}
